#include "KinnullCombatEnemy.h"
#include "KinnullProceduralRig.h"
#include "KinnullNativePawn.h"
#include "KinnullNativeGameMode.h"
#include "Components/CapsuleComponent.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"

AKinnullCombatEnemy::AKinnullCombatEnemy()
{
    PrimaryActorTick.bCanEverTick = true;
    Collision = CreateDefaultSubobject<UCapsuleComponent>(TEXT("EnemyCollision"));
    Collision->InitCapsuleSize(44.f, 92.f);
    Collision->SetCollisionProfileName(TEXT("Pawn"));
    RootComponent = Collision;
    Rig = CreateDefaultSubobject<UKinnullProceduralRig>(TEXT("EnemyRig"));
    Rig->SetupAttachment(RootComponent);
}
void AKinnullCombatEnemy::Initialize(int32 Difficulty, bool bBoss)
{
    bIsBoss = bBoss;
    MaxHealth = bBoss ? 280.f : 45.f + FMath::Max(0,Difficulty) * 12.f;
    Health = MaxHealth;
    Speed = bBoss ? 130.f : 160.f + Difficulty * 11.f;
    Rig->SetRigRole(bBoss ? EKinnullRigRole::SecuritySentinel : EKinnullRigRole::DroneSoldier);
    if (bBoss) Rig->SetWorldScale3D(FVector(1.7f));
}
void AKinnullCombatEnemy::BeginPlay()
{
    Super::BeginPlay();
    Target = Cast<AKinnullNativePawn>(UGameplayStatics::GetPlayerPawn(this,0));
}
void AKinnullCombatEnemy::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    if (IsDefeated() || !Target) return;
    AKinnullNativeGameMode* GM = GetWorld()->GetAuthGameMode<AKinnullNativeGameMode>();
    if (!GM || !GM->IsCombatActive()) return;
    const FVector Delta = Target->GetActorLocation() - GetActorLocation();
    const float Distance = Delta.Size2D();
    NextAttack = FMath::Max(0.f, NextAttack - DeltaSeconds);
    if (Distance > 145.f && Distance < (bIsBoss ? 1450.f : 820.f))
    {
        const FVector Direction = FVector(Delta.X,Delta.Y,0).GetSafeNormal();
        FHitResult Hit;
        AddActorWorldOffset(Direction * Speed * DeltaSeconds,true,&Hit);
        SetActorRotation(Direction.Rotation());
    }
    else if (Distance <= (bIsBoss ? 310.f : 210.f) && NextAttack <= 0.f)
    {
        NextAttack = bIsBoss ? 1.45f : 2.1f;
        Rig->TriggerAttack();
        GM->ApplyEnemyAttack(bIsBoss ? 2 : 1);
    }
}
float AKinnullCombatEnemy::ReceiveKinnullDamage(float Amount)
{
    if (Health <= 0.f || Amount <= 0.f) return 0.f;
    const float Applied = FMath::Min(Amount, Health);
    Health -= Applied;
    Rig->TriggerHit();
    if (Health <= 0.f)
    {
        SetActorEnableCollision(false);
        SetActorTickEnabled(false);
        SetLifeSpan(2.0f);
    }
    return Applied;
}
