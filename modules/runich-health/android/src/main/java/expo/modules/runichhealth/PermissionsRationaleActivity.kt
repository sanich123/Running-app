package expo.modules.runichhealth

import android.app.Activity
import android.os.Bundle
import android.widget.TextView

class PermissionsRationaleActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(
      TextView(this).apply {
        text = "Runich использует завершённые тренировки из Health Connect, чтобы сохранить их в вашем аккаунте."
        setPadding(48, 48, 48, 48)
      }
    )
  }
}
