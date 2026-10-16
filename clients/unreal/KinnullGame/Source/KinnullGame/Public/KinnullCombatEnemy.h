#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "KinnullCombatEnemy.generated.h"

class UCapsuleComponent;
class UKinnullProceduralRig;
class AKinnullNativePawn;

/**
 * Native real-time opponent. This is not a production BehaviorTree/rig,
 * but collision, pursuit, attacks, health and defeat execute in the game world.
 */
UCLASS()
class KINNULLGAME_API AKinnullCombatEnemy : public AActor
{
    GENERATED_BODY()
public:
    AKinnullCombatEnemy();
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;

    UPROPERTY(VisibleAnywhere) TObjectPtr<UCapsuleComponent> Collision;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UKinnullProceduralRig> Rig;

    void Initialize(int32 Difficulty, bool bBoss = false);
    float ReceiveKinnullDamage(float Amount);
    bool IsDefeated() const { return Health <= 0.f; }
    float HealthFraction() const { return MaxHealth > 0.f ? Health / MaxHealth : 0.f; }
    bool IsBoss() const { return bIsBoss; }
private:
    float Health = 60.f;
    float MaxHealth = 60.f;
    float Speed = 175.f;
    float NextAttack = 0.f;
    bool bIsBoss = false;
    UPROPERTY(Transient) TObjectPtr<AKinnullNativePawn> Target;
};
