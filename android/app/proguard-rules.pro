# Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.neoapps.aicrawl.** { *; }

# Keep annotations
-keepattributes *Annotation*

# Capacitor plugins
-keep class com.capacitorjs.** { *; }

# WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Prevent stripping of reflection-used classes
-keepattributes Signature
-keepattributes Exceptions
