using UnrealBuildTool;

public class KinnullGameTarget : TargetRules
{
    public KinnullGameTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("KinnullGame");
    }
}
