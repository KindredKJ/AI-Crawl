#include "KinnullNativeHUD.h"
#include "KinnullNativeGameMode.h"
#include "Engine/Canvas.h"
#include "Kismet/GameplayStatics.h"

void AKinnullNativeHUD::DrawHUD()
{
    Super::DrawHUD();
    if (!Canvas) return;
    const AKinnullNativeGameMode* Rules =
        Cast<AKinnullNativeGameMode>(UGameplayStatics::GetGameMode(this));
    if (!Rules) return;

    const float Width = static_cast<float>(Canvas->SizeX);
    const float Height = static_cast<float>(Canvas->SizeY);
    const float Safe = FMath::Max(20.0f, Width * 0.025f);
    const float Panel = FMath::Min(760.f, Width - Safe * 2.f);
    const float Scale = FMath::Clamp(Width / 1400.f, 0.7f, 1.35f);
    DrawRect(FLinearColor(.012f, .028f, .065f, .88f), Safe, Safe, Panel, 190.f * Scale);
    DrawText(TEXT("KINNULL // THE AWAKENING"), FLinearColor(.25f, .95f, 1.f),
        Safe + 16.f, Safe + 15.f, nullptr, 1.35f * Scale, false);
    DrawText(Rules->GetNativeObjective(), FLinearColor(.92f, .95f, 1.f),
        Safe + 16.f, Safe + 48.f * Scale, nullptr, .85f * Scale, false);
    DrawText(Rules->GetNativeStatus(), FLinearColor(.85f, .62f, 1.f),
        Safe + 16.f, Safe + 80.f * Scale, nullptr, .82f * Scale, false);
    DrawRect(FLinearColor(.16f, .13f, .24f), Safe + 16.f, Safe + 110.f * Scale,
        Panel - 32.f, 12.f * Scale);
    DrawRect(FLinearColor(.4f, .77f, 1.f), Safe + 16.f, Safe + 110.f * Scale,
        (Panel - 32.f) * Rules->GetNativeIntegrity() / 100.f, 12.f * Scale);
    DrawText(Rules->GetNativeNotice(), FLinearColor(.96f, .75f, .33f),
        Safe + 16.f, Safe + 134.f * Scale, nullptr, .85f * Scale, false);

    const FString Controls =
        TEXT("WASD MOVE   |   E INTERACT   |   F DEPTH   |   SPACE PREDICT   |   R NEW RUN AFTER COMPLETION");
    DrawRect(FLinearColor(.015f, .024f, .05f, .8f),
        Safe, Height - 56.f * Scale - Safe, Width - 2.f * Safe, 56.f * Scale);
    DrawText(Controls, FLinearColor(.6f, .89f, .95f), Safe + 14.f,
        Height - 37.f * Scale - Safe, nullptr, .8f * Scale, false);
}
