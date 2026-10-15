using UnrealBuildTool;

public class KinnullGameEditorTarget : TargetRules
{
    public KinnullGameEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("KinnullGame");
    }
}
