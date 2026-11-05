package expo.modules.runichauth

import android.app.Activity
import android.content.Context
import android.content.Intent
import androidx.lifecycle.LifecycleOwner
import com.vk.id.VKID
import com.vk.id.AccessToken
import com.vk.id.auth.AuthCodeData
import com.vk.id.auth.VKIDAuthCallback
import com.vk.id.VKIDAuthFail
import com.vk.id.auth.VKIDAuthParams
import com.yandex.authsdk.YandexAuthLoginOptions
import com.yandex.authsdk.YandexAuthOptions
import com.yandex.authsdk.YandexAuthResult
import com.yandex.authsdk.YandexAuthSdk
import expo.modules.kotlin.Promise
import expo.modules.kotlin.activityresult.AppContextActivityResultContract
import expo.modules.kotlin.activityresult.AppContextActivityResultLauncher
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.Serializable
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.concurrent.atomic.AtomicBoolean
import android.util.Base64

private class YandexLoginInput : Serializable

private class YandexLoginContract(
  private val sdk: YandexAuthSdk,
) : AppContextActivityResultContract<YandexLoginInput, YandexAuthResult> {
  override fun createIntent(context: Context, input: YandexLoginInput): Intent =
    sdk.contract.createIntent(context, YandexAuthLoginOptions())

  override fun parseResult(input: YandexLoginInput, resultCode: Int, intent: Intent?): YandexAuthResult =
    sdk.contract.parseResult(resultCode, intent)
}

class RunichAuthModule : Module() {
  private var yandexLauncher: AppContextActivityResultLauncher<YandexLoginInput, YandexAuthResult>? = null
  private var vkInitialized = false

  override fun definition() = ModuleDefinition {
    Name("RunichAuth")

    RegisterActivityContracts {
      val context = appContext.reactContext ?: throw CodedException("The Android app context is unavailable.")
      val sdk = YandexAuthSdk.create(YandexAuthOptions(context))
      yandexLauncher = registerForActivityResult(YandexLoginContract(sdk))
    }

    AsyncFunction("loginWithYandex") { promise: Promise ->
      val launcher = yandexLauncher
      if (launcher == null) {
        promise.reject("YANDEX_AUTH_UNAVAILABLE", "Yandex LoginSDK is not initialized.", null)
      } else {
        launcher.launch(YandexLoginInput()) { result ->
          when (result) {
            is YandexAuthResult.Success -> promise.resolve(mapOf("accessToken" to result.token.value, "cancelled" to false))
            is YandexAuthResult.Failure -> promise.reject(
              "YANDEX_AUTH_FAILED",
              result.exception.localizedMessage ?: "Yandex authorization failed.",
              result.exception,
            )
            YandexAuthResult.Cancelled -> promise.resolve(mapOf("cancelled" to true))
          }
        }
      }
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("loginWithVk") { promise: Promise ->
      val activity = appContext.currentActivity
      if (activity !is LifecycleOwner) {
        promise.reject("VK_AUTH_UNAVAILABLE", "The Android activity is unavailable.", null)
        return@AsyncFunction
      }

      runCatching {
        synchronized(this@RunichAuthModule) {
          if (!vkInitialized) {
            VKID.init(activity.application)
            vkInitialized = true
          }
        }
      }
        .onFailure { error ->
          promise.reject("VK_AUTH_UNAVAILABLE", error.localizedMessage ?: "VK ID could not be initialized.", error)
          return@AsyncFunction
        }

      val settled = AtomicBoolean(false)
      val codeVerifier = ByteArray(32).also { SecureRandom().nextBytes(it) }
        .let { Base64.encodeToString(it, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING) }
      val codeChallenge = MessageDigest.getInstance("SHA-256")
        .digest(codeVerifier.toByteArray(Charsets.US_ASCII))
        .let { Base64.encodeToString(it, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING) }
      val callback = object : VKIDAuthCallback {
        override fun onAuth(accessToken: AccessToken) {
          if (settled.compareAndSet(false, true)) {
            promise.reject("VK_AUTH_FAILED", "VK ID returned a token instead of a PKCE authorization code.", null)
          }
        }

        override fun onAuthCode(data: AuthCodeData, isCompletion: Boolean) {
          if (isCompletion && settled.compareAndSet(false, true)) {
            promise.resolve(
              mapOf(
                "code" to data.code,
                "deviceId" to data.deviceId,
                "codeVerifier" to codeVerifier,
                "cancelled" to false,
              ),
            )
          }
        }

        override fun onFail(fail: VKIDAuthFail) {
          if (!settled.compareAndSet(false, true)) return
          if (fail is VKIDAuthFail.Canceled) {
            promise.resolve(mapOf("cancelled" to true))
          } else {
            promise.reject("VK_AUTH_FAILED", fail.toString(), null)
          }
        }
      }

      try {
        VKID.instance.authorize(
          lifecycleOwner = activity,
          callback = callback,
          params = VKIDAuthParams {
            this.codeChallenge = codeChallenge
            scopes = setOf("vkid.personal_info", "email")
          },
        )
      } catch (error: Throwable) {
        if (settled.compareAndSet(false, true)) {
          promise.reject("VK_AUTH_FAILED", error.localizedMessage ?: "VK authorization failed.", error)
        }
      }
    }.runOnQueue(Queues.MAIN)
  }
}
