import CoreLocation
import ExpoModulesCore
import HealthKit

public final class RunichHealthModule: Module {
  private let healthStore = HKHealthStore()

  public func definition() -> ModuleDefinition {
    Name("RunichHealth")

    AsyncFunction("getAvailability") {
      HKHealthStore.isHealthDataAvailable() ? "available" : "not-supported"
    }

    AsyncFunction("getPermissions") { () async -> [String: Any] in
      ["available": HKHealthStore.isHealthDataAvailable()]
    }

    AsyncFunction("requestPermissions") { () async throws -> [String: Any] in
      guard HKHealthStore.isHealthDataAvailable() else {
        return ["available": false]
      }

      try await healthStore.requestAuthorization(toShare: [], read: readTypes())
      // HealthKit intentionally does not reveal whether a read permission was granted.
      return ["available": true]
    }

    AsyncFunction("readWorkouts") { (startDate: String, endDate: String) async throws -> [[String: Any]] in
      guard HKHealthStore.isHealthDataAvailable() else { return [] }
      guard let start = parseISO8601Date(startDate),
            let end = parseISO8601Date(endDate) else {
        throw NSError(domain: "RunichHealth", code: 1, userInfo: [NSLocalizedDescriptionKey: "Некорректная дата тренировки"])
      }

      let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
      let workouts = try await queryWorkouts(predicate: predicate)
      var result: [[String: Any]] = []

      for workout in workouts {
        result.append(await makeWorkout(workout))
      }

      return result
    }
  }

  private func readTypes() -> Set<HKObjectType> {
    var types = Set<HKObjectType>()
    types.insert(HKObjectType.workoutType())
    types.insert(HKSeriesType.workoutRoute())
    if let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate) {
      types.insert(heartRateType)
    }

    if let stepCountType = HKObjectType.quantityType(forIdentifier: .stepCount) {
      types.insert(stepCountType)
    }

    return types
  }

  private func queryWorkouts(predicate: NSPredicate) async throws -> [HKWorkout] {
    try await withCheckedThrowingContinuation { continuation in
      let query = HKSampleQuery(
        sampleType: HKObjectType.workoutType(),
        predicate: predicate,
        limit: HKObjectQueryNoLimit,
        sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)]
      ) { _, samples, error in
        if let error {
          continuation.resume(throwing: error)
          return
        }
        continuation.resume(returning: (samples as? [HKWorkout]) ?? [])
      }
      healthStore.execute(query)
    }
  }

  private func makeWorkout(_ workout: HKWorkout) async -> [String: Any] {
    let (locations, routeErrorCode) = await routeLocationsWithDiagnostics(for: workout)
    let (heartRateSamples, heartRateErrorCode) = await heartRateSamples(for: workout)
    var diagnostics: [String: Any] = [
      "dataOrigin": workout.sourceRevision.source.name,
      "routeStatus": routeErrorCode == nil ? (locations.isEmpty ? "no-route-data" : "route-in-record") : "route-read-error",
      "routePointCount": locations.count,
      "heartRateSampleCount": heartRateSamples.count
    ]
    if let routeErrorCode { diagnostics["routeErrorCode"] = routeErrorCode }
    if let heartRateErrorCode { diagnostics["heartRateErrorCode"] = heartRateErrorCode }

    var result: [String: Any] = [
      "source": "healthkit",
      "sourceActivityId": workout.uuid.uuidString,
      "date": ISO8601DateFormatter().string(from: workout.startDate),
      "timeZone": TimeZone.current.identifier,
      "sport": mapSport(workout.workoutActivityType),
      "duration": max(0, Int((workout.duration * 1000).rounded())),
      "distance": workout.totalDistance?.doubleValue(for: HKUnit.meter()) ?? 0,
      "locations": locations,
      "diagnostics": diagnostics
    ]

    if !heartRateSamples.isEmpty { result["heartRateSamples"] = heartRateSamples }

    if let title = workout.workoutActivityType.name?.trimmingCharacters(in: .whitespacesAndNewlines), !title.isEmpty {
      result["title"] = title
    }

    if let steps = await steps(for: workout), steps > 0 {
      result["steps"] = steps
    }

    return result
  }

  private func steps(for workout: HKWorkout) async -> Int? {
    guard let type = HKObjectType.quantityType(forIdentifier: .stepCount) else { return nil }
    let predicate = HKQuery.predicateForSamples(withStart: workout.startDate, end: workout.endDate, options: .strictStartDate)

    return await withCheckedContinuation { continuation in
      let query = HKStatisticsQuery(
        quantityType: type,
        quantitySamplePredicate: predicate,
        options: .cumulativeSum
      ) { _, statistics, _ in
        let value = statistics?.sumQuantity()?.doubleValue(for: HKUnit.count())
        continuation.resume(returning: value.map { max(0, Int($0.rounded())) })
      }
      healthStore.execute(query)
    }
  }

  private func routeLocationsWithDiagnostics(for workout: HKWorkout) async -> (locations: [[String: Any]], errorCode: String?) {
    do {
      let routes = try await queryRoutes(for: workout)
      var locations: [[String: Any]] = []
      for route in routes {
        locations.append(contentsOf: try await queryRouteLocations(route))
      }
      return (locations, nil)
    } catch {
      return ([], errorCode(for: error))
    }
  }

  private func heartRateSamples(for workout: HKWorkout) async -> (samples: [[String: Any]], errorCode: String?) {
    guard let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate) else { return ([], nil) }

    do {
      let workoutSamples = try await queryHeartRateSamples(
        type: heartRateType,
        predicate: HKQuery.predicateForObjects(from: workout)
      )
      let associatedSamples = mapHeartRateSamples(workoutSamples, for: workout)
      if !associatedSamples.isEmpty { return (associatedSamples, nil) }
    } catch {
      // Some sources save heart-rate samples in HealthKit without linking them to the workout.
    }

    let intervalPredicate = HKQuery.predicateForSamples(
      withStart: workout.startDate,
      end: workout.endDate,
      options: .strictStartDate
    )
    do {
      let intervalSamples = try await queryHeartRateSamples(type: heartRateType, predicate: intervalPredicate)
      return (mapHeartRateSamples(intervalSamples, for: workout), nil)
    } catch {
      return ([], errorCode(for: error))
    }
  }

  private func queryHeartRateSamples(type: HKQuantityType, predicate: NSPredicate) async throws -> [HKQuantitySample] {
    try await withCheckedThrowingContinuation { continuation in
      let query = HKSampleQuery(
        sampleType: type,
        predicate: predicate,
        limit: HKObjectQueryNoLimit,
        sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]
      ) { _, samples, error in
        if let error {
          continuation.resume(throwing: error)
          return
        }
        continuation.resume(returning: (samples as? [HKQuantitySample]) ?? [])
      }
      healthStore.execute(query)
    }
  }

  private func mapHeartRateSamples(_ samples: [HKQuantitySample], for workout: HKWorkout) -> [[String: Any]] {
    let heartRateUnit = HKUnit.count().unitDivided(by: HKUnit.minute())
    var seenSamples = Set<String>()

    return samples.compactMap { sample in
      let timestamp = Int((sample.startDate.timeIntervalSince1970 * 1000).rounded())
      let beatsPerMinute = sample.quantity.doubleValue(for: heartRateUnit)
      guard sample.startDate >= workout.startDate,
            sample.startDate <= workout.endDate,
            beatsPerMinute.isFinite,
            beatsPerMinute >= 1,
            beatsPerMinute <= 300 else {
        return nil
      }

      let roundedBeatsPerMinute = Int(beatsPerMinute.rounded())
      let key = "\(timestamp):\(roundedBeatsPerMinute)"
      guard seenSamples.insert(key).inserted else { return nil }
      return ["timestamp": timestamp, "beatsPerMinute": roundedBeatsPerMinute]
    }
  }

  private func parseISO8601Date(_ value: String) -> Date? {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let date = formatter.date(from: value) { return date }

    formatter.formatOptions = [.withInternetDateTime]
    return formatter.date(from: value)
  }

  private func errorCode(for error: Error) -> String {
    String((error as NSError).code)
  }

  private func queryRoutes(for workout: HKWorkout) async throws -> [HKWorkoutRoute] {
    try await withCheckedThrowingContinuation { continuation in
      let predicate = HKQuery.predicateForObjects(from: workout)
      let query = HKSampleQuery(
        sampleType: HKSeriesType.workoutRoute(),
        predicate: predicate,
        limit: HKObjectQueryNoLimit,
        sortDescriptors: nil
      ) { _, samples, error in
        if let error {
          continuation.resume(throwing: error)
          return
        }
        continuation.resume(returning: (samples as? [HKWorkoutRoute]) ?? [])
      }
      healthStore.execute(query)
    }
  }

  private func queryRouteLocations(_ route: HKWorkoutRoute) async throws -> [[String: Any]] {
    try await withCheckedThrowingContinuation { continuation in
      var locations: [[String: Any]] = []
      let query = HKWorkoutRouteQuery(route: route) { _, newLocations, done, error in
        if let error {
          continuation.resume(throwing: error)
          return
        }

        locations.append(contentsOf: (newLocations ?? []).map { location in
          var coords: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude
          ]
          if location.altitude.isFinite { coords["altitude"] = location.altitude }
          if location.horizontalAccuracy >= 0 { coords["accuracy"] = location.horizontalAccuracy }
          if location.course >= 0 { coords["heading"] = location.course }
          if location.speed >= 0 { coords["speed"] = location.speed }
          return [
            "timestamp": Int((location.timestamp.timeIntervalSince1970 * 1000).rounded()),
            "coords": coords
          ]
        })

        if done {
          continuation.resume(returning: locations)
        }
      }
      healthStore.execute(query)
    }
  }

  private func mapSport(_ type: HKWorkoutActivityType) -> String {
    switch type {
    case .running: return "run"
    case .cycling: return "bike"
    case .walking: return "walk"
    case .hiking: return "hike"
    case .swimming: return "swim"
    default: return "workout"
    }
  }
}

private extension HKWorkoutActivityType {
  var name: String? {
    switch self {
    case .running: return "Бег"
    case .cycling: return "Велосипед"
    case .walking: return "Ходьба"
    case .hiking: return "Поход"
    case .swimming: return "Плавание"
    default: return nil
    }
  }
}
