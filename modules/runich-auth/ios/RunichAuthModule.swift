import ExpoModulesCore
import UIKit
import VKID
import YandexLoginSDK

public class RunichAuthModule: Module, AuthCodeHandler, YandexLoginSDKObserver {
  private var yandexPromise: Promise?
  private var vkPromise: Promise?
  private var yandexClientId: String?
  private var isYandexObserverRegistered = false
  private var isVkConfigured = false

  public func definition() -> ModuleDefinition {
    Name("RunichAuth")

    AsyncFunction("loginWithYandex") { (promise: Promise) in
      guard self.yandexPromise == nil else {
        promise.reject("AUTH_IN_PROGRESS", "A social sign-in is already in progress.")
        return
      }
      guard let clientId = Self.infoValue("YANDEX_NATIVE_CLIENT_ID") else {
        promise.reject("YANDEX_AUTH_CONFIG", "YANDEX_NATIVE_CLIENT_ID is missing from the iOS build.")
        return
      }
      guard let viewController = self.appContext?.utilities?.currentViewController() else {
        promise.reject("YANDEX_AUTH_UNAVAILABLE", "The iOS view controller is unavailable.")
        return
      }

      do {
        try self.activateYandexIfNeeded(clientId: clientId)
        self.yandexPromise = promise
        try YandexLoginSDK.shared.authorize(
          with: viewController,
          authorizationStrategy: .default
        )
      } catch {
        self.yandexPromise = nil
        promise.reject(error)
      }
    }.runOnQueue(.main)

    AsyncFunction("loginWithVk") { (promise: Promise) in
      guard self.vkPromise == nil else {
        promise.reject("AUTH_IN_PROGRESS", "A social sign-in is already in progress.")
        return
      }
      guard let viewController = self.appContext?.utilities?.currentViewController() else {
        promise.reject("VK_AUTH_UNAVAILABLE", "The iOS view controller is unavailable.")
        return
      }

      do {
        try self.configureVkIfNeeded()
      } catch {
        promise.reject(error)
        return
      }

      self.vkPromise = promise
      let authConfiguration = AuthConfiguration(
        flow: .confidentialClientFlow(codeExchanger: self),
        scope: Scope("vkid.personal_info email")
      )
      VKID.shared.authorize(
        with: authConfiguration,
        using: .uiViewController(viewController)
      ) { result in
        guard case .failure(let error) = result, let pendingPromise = self.vkPromise else {
          return
        }
        self.vkPromise = nil

        if let authError = error as? AuthError {
          switch authError {
          case .cancelled:
            pendingPromise.resolve(["cancelled": true])
          default:
            pendingPromise.reject(error)
          }
        } else {
          pendingPromise.reject(error)
        }
      }
    }.runOnQueue(.main)
  }

  public func didFinishLogin(with result: Result<LoginResult, any Error>) {
    DispatchQueue.main.async {
      guard let promise = self.yandexPromise else { return }
      self.yandexPromise = nil

      switch result {
      case .success(let loginResult):
        promise.resolve(["accessToken": loginResult.token, "cancelled": false])
      case .failure(let error):
        if Self.isCancelled(error) {
          promise.resolve(["cancelled": true])
        } else {
          promise.reject(error)
        }
      }
    }
  }

  public func exchange(_ code: AuthorizationCode, finishFlow: @escaping () -> Void) {
    DispatchQueue.main.async {
      guard let promise = self.vkPromise else {
        finishFlow()
        return
      }
      self.vkPromise = nil

      guard let codeVerifier = code.codeVerifier else {
        promise.reject("VK_CODE_VERIFIER_MISSING", "VK ID did not return the PKCE verifier.")
        finishFlow()
        return
      }

      promise.resolve([
        "code": code.code,
        "deviceId": code.deviceId,
        "codeVerifier": codeVerifier,
        "cancelled": false,
      ])
      finishFlow()
    }
  }

  private func activateYandexIfNeeded(clientId: String) throws {
    if !isYandexObserverRegistered {
      YandexLoginSDK.shared.add(observer: self)
      isYandexObserverRegistered = true
    }
    guard yandexClientId != clientId else { return }
    try YandexLoginSDK.shared.activate(with: clientId)
    yandexClientId = clientId
  }

  private func configureVkIfNeeded() throws {
    guard !isVkConfigured else { return }
    guard
      let clientId = Self.infoValue("VK_NATIVE_IOS_CLIENT_ID"),
      let clientSecret = Self.infoValue("VK_NATIVE_IOS_CLIENT_SECRET")
    else {
      throw NativeAuthConfigurationError("VK iOS credentials are missing from the iOS build.")
    }

    try VKID.shared.set(
      config: Configuration(
        appCredentials: AppCredentials(clientId: clientId, clientSecret: clientSecret)
      )
    )
    isVkConfigured = true
  }

  private static func infoValue(_ key: String) -> String? {
    guard let value = Bundle.main.object(forInfoDictionaryKey: key) as? String else { return nil }
    let trimmedValue = value.trimmingCharacters(in: .whitespacesAndNewlines)
    return trimmedValue.isEmpty ? nil : trimmedValue
  }

  private static func isCancelled(_ error: Error) -> Bool {
    let nsError = error as NSError
    if nsError.code == NSURLErrorCancelled { return true }
    let message = nsError.localizedDescription.lowercased()
    return message.contains("cancel") || message.contains("отмен")
  }
}

private struct NativeAuthConfigurationError: LocalizedError {
  let message: String

  init(_ message: String) {
    self.message = message
  }

  var errorDescription: String? { message }
}

public class RunichAuthAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    let yandexHandled = YandexLoginSDK.shared.tryHandleOpenURL(url)
    let vkHandled = VKID.shared.open(url: url)
    return yandexHandled || vkHandled
  }

  public func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let yandexHandled = YandexLoginSDK.shared.tryHandleUserActivity(userActivity)
    let vkHandled = userActivity.webpageURL.map { VKID.shared.open(url: $0) } ?? false
    return yandexHandled || vkHandled
  }
}
