#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "KinnullNativeHUD.generated.h"

UCLASS()
class KINNULLGAME_API AKinnullNativeHUD : public AHUD
{
    GENERATED_BODY()
public:
    virtual void DrawHUD() override;
};
