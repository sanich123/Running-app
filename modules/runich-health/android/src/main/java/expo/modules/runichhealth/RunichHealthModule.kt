package expo.modules.runichhealth

import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.contracts.ExerciseRouteRequestContract
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseRoute
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import expo.modules.kotlin.activityresult.AppContextActivityResultContract
import expo.modules.kotlin.activityresult.AppContextActivityResultLauncher
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.Serializable
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeParseException
import kotlin.reflect.KClass

private const val HEALTH_CONNECT_PACKAGE = "com.google.android.apps.healthdata"
private const val READ_EXERCISE_ROUTES = "android.permission.health.READ_EXERCISE_ROUTES"

private data class PermissionRequest(val permissions: ArrayList<String>) : Serializable

private class HealthConnectPermissionContract :
  AppContextActivityResultContract<PermissionRequest, ArrayList<String>> {
  private val delegate = PermissionController.createRequestPermissionResultContract()

  override fun createIntent(context: Context, input: PermissionRequest): Intent {
    return delegate.createIntent(context, input.permissions.toSet())
  }

  override fun parseResult(input: PermissionRequest, resultCode: Int, intent: Intent?): ArrayList<String> {
    return ArrayList(delegate.parseResult(resultCode, intent))
  }
}

private class HealthConnectExerciseRouteContract :
  AppContextActivityResultContract<String, ExerciseRoute> {
  private val delegate = ExerciseRouteRequestContract()

  override fun createIntent(context: Context, input: String): Intent {
    return delegate.createIntent(context, input)
  }

  override fun parseResult(input: String, resultCode: Int, intent: Intent?): ExerciseRoute {
    return delegate.parseResult(resultCode, intent) ?: ExerciseRoute(emptyList())
  }
}

class RunichHealthModule : Module() {
  private lateinit var permissionsLauncher: AppContextActivityResultLauncher<PermissionRequest, ArrayList<String>>
  private lateinit var routeLauncher: AppContextActivityResultLauncher<String, ExerciseRoute>

  private val requiredPermissions: Set<String>
    get() = setOf(
      HealthPermission.getReadPermission(ExerciseSessionRecord::class),
      HealthPermission.getReadPermission(DistanceRecord::class),
      HealthPermission.getReadPermission(StepsRecord::class),
      READ_EXERCISE_ROUTES,
    )

  override fun definition() = ModuleDefinition {
    Name("RunichHealth")

    AsyncFunction("getAvailability") {
      availability()
    }

    AsyncFunction("getPermissions") Coroutine { ->
      permissionsResult()
    }

    AsyncFunction("requestPermissions") Coroutine { ->
      if (availability() != "available") return@Coroutine permissionsResult()
      permissionsLauncher.launch(PermissionRequest(ArrayList(requiredPermissions)))
      permissionsResult()
    }

    AsyncFunction("readWorkouts") Coroutine { startDate: String, endDate: String ->
      readWorkouts(startDate, endDate)
    }

    RegisterActivityContracts {
      permissionsLauncher = registerForActivityResult(HealthConnectPermissionContract())
      routeLauncher = registerForActivityResult(HealthConnectExerciseRouteContract())
    }
  }

  private val context: Context
    get() = requireNotNull(appContext.reactContext)

  private fun availability(): String {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return "not-supported"
    return when (HealthConnectClient.getSdkStatus(context)) {
      HealthConnectClient.SDK_AVAILABLE -> "available"
      HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> "provider-update-required"
      else -> "not-supported"
    }
  }

  private suspend fun permissionsResult(): Map<String, Any> {
    if (availability() != "available") return mapOf("available" to false, "granted" to false)
    val granted = healthConnectClient().permissionController.getGrantedPermissions()
    return mapOf("available" to true, "granted" to granted.containsAll(requiredPermissions))
  }

  private fun healthConnectClient(): HealthConnectClient {
    return HealthConnectClient.getOrCreate(context)
  }

  private suspend fun readWorkouts(startDate: String, endDate: String): List<Map<String, Any?>> {
    if (availability() != "available") return emptyList()

    val start = parseInstant(startDate)
    val end = parseInstant(endDate)
    val client = healthConnectClient()
    val sessions = readAll(client, ExerciseSessionRecord::class, TimeRangeFilter.between(start, end))

    return sessions.map { session ->
      val locations = readRoute(client, session)
      val distance = readDistance(client, session)
      val steps = readSteps(client, session)
      val duration = (session.endTime.toEpochMilli() - session.startTime.toEpochMilli()).coerceAtLeast(0)
      val result = mutableMapOf<String, Any?>(
        "source" to "health-connect",
        "sourceActivityId" to session.metadata.id,
        "date" to session.startTime.toString(),
        "timeZone" to ZoneId.systemDefault().id,
        "sport" to mapSport(session.exerciseType),
        "duration" to duration,
        "distance" to distance,
        "locations" to locations,
      )
      session.title?.takeIf { it.isNotBlank() }?.let { result["title"] = it }
      if (steps > 0) result["steps"] = steps
      result
    }
  }

  private fun parseInstant(value: String): Instant {
    try {
      return Instant.parse(value)
    } catch (_: DateTimeParseException) {
      throw IllegalArgumentException("Некорректная дата тренировки")
    }
  }

  private suspend fun readDistance(
    client: HealthConnectClient,
    session: ExerciseSessionRecord,
  ): Double {
    return readAll(client, DistanceRecord::class, TimeRangeFilter.between(session.startTime, session.endTime))
      .sumOf { it.distance.inMeters }
  }

  private suspend fun readSteps(
    client: HealthConnectClient,
    session: ExerciseSessionRecord,
  ): Long {
    return readAll(client, StepsRecord::class, TimeRangeFilter.between(session.startTime, session.endTime))
      .sumOf { it.count }
  }

  private suspend fun readRoute(
    client: HealthConnectClient,
    session: ExerciseSessionRecord,
  ): List<Map<String, Any?>> {
    return try {
      routeLauncher.launch(session.metadata.id).route.map { location ->
        mapOf(
          "timestamp" to location.time.toEpochMilli(),
          "coords" to mapOf(
            "latitude" to location.latitude,
            "longitude" to location.longitude,
            "altitude" to location.altitude?.inMeters,
            "accuracy" to location.horizontalAccuracy?.inMeters,
          ),
        )
      }
    } catch (_: Exception) {
      emptyList()
    }
  }

  private fun mapSport(exerciseType: Int): String {
    return when (exerciseType) {
      ExerciseSessionRecord.EXERCISE_TYPE_RUNNING -> "run"
      ExerciseSessionRecord.EXERCISE_TYPE_BIKING -> "bike"
      ExerciseSessionRecord.EXERCISE_TYPE_WALKING -> "walk"
      ExerciseSessionRecord.EXERCISE_TYPE_HIKING -> "hike"
      ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_POOL,
      ExerciseSessionRecord.EXERCISE_TYPE_SWIMMING_OPEN_WATER -> "swim"
      else -> "workout"
    }
  }

  private suspend fun <T : Record> readAll(
    client: HealthConnectClient,
    recordType: KClass<T>,
    timeRangeFilter: TimeRangeFilter,
  ): List<T> {
    val records = mutableListOf<T>()
    var pageToken: String? = null
    do {
      val response = client.readRecords(
        ReadRecordsRequest(
          recordType = recordType,
          timeRangeFilter = timeRangeFilter,
          pageToken = pageToken,
        )
      )
      records += response.records
      pageToken = response.pageToken?.takeIf { it.isNotEmpty() }
    } while (pageToken != null)
    return records
  }
}
