#include "KinnullNativeGameMode.h"
#include "KinnullNativePawn.h"
#include "KinnullNativeHUD.h"
#include "KinnullPropActor.h"
#include "Engine/Engine.h"
#include "Engine/DirectionalLight.h"
#include "Engine/PointLight.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/PlayerStart.h"
#include "Kismet/GameplayStatics.h"
#include "Math/UnrealMathUtility.h"
#include "Components/LightComponent.h"
#include "Components/DirectionalLightComponent.h"
#include "Components/PointLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"

namespace Kinnull
{
    constexpr int32 Width = 13;
    constexpr int32 Height = 9;
    constexpr float CellSize = 220.f;
    constexpr TCHAR Slot[] = TEXT("KINNULL001_Local");
    const int32 AxisCounts[7] = { 12, 10, 9, 8, 8, 8, 9 };
}

AKinnullNativeGameMode::AKinnullNativeGameMode()
{
    PrimaryActorTick.bCanEverTick = true;
    DefaultPawnClass = AKinnullNativePawn::StaticClass();
    HUDClass = AKinnullNativeHUD::StaticClass();
    PlayerControllerClass = APlayerController::StaticClass();
}

FVector AKinnullNativeGameMode::Grid(int32 X, int32 Y, float Z)
{
    return FVector(X * Kinnull::CellSize, Y * Kinnull::CellSize, Z);
}

void AKinnullNativeGameMode::ResetToInitialState()
{
    State = NewObject<UKinnullNativeSaveGame>(this);
    State->CoreVector.Init(100.0f, 64);
    State->LastPlayerLocation = Grid(2, 2, 120.f);
    EventCounter = 0;
    bPredictionArmed = false;
    bRequestedRecursive = false;
    bRestoredPosition = false;
}

void AKinnullNativeGameMode::LoadSavedState()
{
    ResetToInitialState();
    if (!UGameplayStatics::DoesSaveGameExist(Kinnull::Slot, 0)) return;
    UKinnullNativeSaveGame* Candidate = Cast<UKinnullNativeSaveGame>(
        UGameplayStatics::LoadGameFromSlot(Kinnull::Slot, 0));
    if (!Candidate || Candidate->FormatVersion != 1 ||
        Candidate->CoreVector.Num() != 64 ||
        Candidate->HighestBand < 0 || Candidate->HighestBand > 4 ||
        Candidate->EventCount < 0 || Candidate->EventCount > 200000 ||
        !Candidate->LastPlayerLocation.IsFinite() ||
        Candidate->LastPlayerLocation.Z < 0 ||
        Candidate->LastPlayerLocation.X < Kinnull::CellSize ||
        Candidate->LastPlayerLocation.X > 11 * Kinnull::CellSize ||
        Candidate->LastPlayerLocation.Y < Kinnull::CellSize ||
        Candidate->LastPlayerLocation.Y > 7 * Kinnull::CellSize)
    {
        Notice(TEXT("Saved Kinnull state rejected; starting a new local run."), FColor::Yellow);
        return;
    }
    for (float Value : Candidate->CoreVector)
        if (!FMath::IsFinite(Value) || Value < 0 || Value > 100) return;
    if (Candidate->Focus < 0 || Candidate->Focus > 6 ||
        Candidate->Hull < 0 || Candidate->Hull > 5 ||
        !FMath::IsFinite(Candidate->ForeignDensity) ||
        Candidate->ForeignDensity < 0 || Candidate->ForeignDensity > 100 ||
        static_cast<uint8>(Candidate->Phase) > 4 ||
        static_cast<uint8>(Candidate->Host) > 2)
        return;
    State = Candidate;
    EventCounter = State->EventCount;
}

void AKinnullNativeGameMode::SaveProgress()
{
    if (!State) return;
    State->EventCount = ++EventCounter;
    if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
        if (APawn* Pawn = PC->GetPawn()) State->LastPlayerLocation = Pawn->GetActorLocation();
    UGameplayStatics::SaveGameToSlot(State, Kinnull::Slot, 0);
}

AKinnullPropActor* AKinnullNativeGameMode::Put(
    EKinnullObject Type, int32 X, int32 Y,
    float Z, FVector Scale, bool bBlocking)
{
    if (!GetWorld()) return nullptr;
    FActorSpawnParameters Params;
    Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
    AKinnullPropActor* Item = GetWorld()->SpawnActor<AKinnullPropActor>(
        AKinnullPropActor::StaticClass(), FTransform::Identity, Params);
    if (Item)
    {
        Item->Initialize(Type, Grid(X, Y, Z), Scale, bBlocking);
        Props.Add(Item);
    }
    return Item;
}

void AKinnullNativeGameMode::GenerateFacility()
{
    // Layout and markers correspond to the same AI Crawl KINNULL-001 browser mission.
    // These geometry pieces are runtime proof-of-play placeholders, NOT final authored assets.
    for (int32 Y = 0; Y < Kinnull::Height; ++Y)
    {
        for (int32 X = 0; X < Kinnull::Width; ++X)
        {
            Put(EKinnullObject::Floor, X, Y, -80.f, FVector(2.19f, 2.19f, 0.3f), false);
            const bool bWall = X == 0 || Y == 0 ||
                X == Kinnull::Width - 1 || Y == Kinnull::Height - 1 ||
                (X == 6 && Y != 3) || (X == 10 && Y != 5);
            if (bWall)
                Put(EKinnullObject::Wall, X, Y, 120.f, FVector(2.2f, 2.2f, 3.5f), true);
        }
    }
    Put(EKinnullObject::Camera, 3, 2, 125.f, FVector(0.7f, 0.7f, 1.2f), false);
    Put(EKinnullObject::Relay, 4, 4, 125.f, FVector(0.9f, 0.9f, 1.2f), false);
    InnerGate = Put(EKinnullObject::InnerGate, 6, 3, 130.f,
                    FVector(2.2f, 2.2f, 3.0f), !State->bInnerGateOpen);
    Put(EKinnullObject::Maintenance, 7, 3, 100.f, FVector(0.9f), false);
    Put(EKinnullObject::Security, 9, 5, 120.f, FVector(1.3f), false);
    Put(EKinnullObject::Sentry, 8, 2, 100.f, FVector(0.85f), false);
    Put(EKinnullObject::Sentry, 8, 6, 100.f, FVector(0.85f), false);
    Put(EKinnullObject::UtilityConsole, 9, 7, 110.f, FVector(0.7f, 0.7f, 1.2f), false);
    OuterGate = Put(EKinnullObject::OuterGate, 10, 5, 130.f,
                    FVector(2.2f, 2.2f, 3.0f), !State->bOuterGateOpen);
    Put(EKinnullObject::Exit, 11, 7, 120.f, FVector(1.5f), false);

    if (State->bInnerGateOpen && InnerGate) InnerGate->OpenGate();
    if (State->bOuterGateOpen && OuterGate) OuterGate->OpenGate();

    ADirectionalLight* MainLight = GetWorld()->SpawnActor<ADirectionalLight>(
        ADirectionalLight::StaticClass(),
        FTransform(FRotator(-60.f, -40.f, 0.f), Grid(6, 4, 1600.f)));
    if (MainLight)
    {
        MainLight->GetLightComponent()->SetIntensity(8.f);
        MainLight->GetLightComponent()->SetLightColor(FLinearColor(0.2f, 0.5f, 1.0f));
    }
    for (const FIntPoint Room : { FIntPoint(3, 2), FIntPoint(8, 3), FIntPoint(9, 7) })
    {
        APointLight* Light = GetWorld()->SpawnActor<APointLight>(
            APointLight::StaticClass(),
            FTransform(FRotator::ZeroRotator, Grid(Room.X, Room.Y, 650.f)));
        if (Light)
        {
            Light->PointLightComponent->SetIntensity(6500.f);
            Light->PointLightComponent->SetAttenuationRadius(1400.f);
            Light->PointLightComponent->SetLightColor(FLinearColor(0.05f, 0.65f, 1.f));
        }
    }
}

void AKinnullNativeGameMode::BeginPlay()
{
    Super::BeginPlay();
    LoadSavedState();
    // Supply a guaranteed in-world spawn point even when no custom .umap exists.
    // The saved position is restored after possession once the player controller is available.
    GetWorld()->SpawnActor<APlayerStart>(
        APlayerStart::StaticClass(),
        FTransform(FRotator::ZeroRotator, Grid(2, 2, 145.f)));
    GenerateFacility();
    Notice(TEXT("KINNULL // AWAKENING | W A S D to move, E interact, F switch depth, Space predict."),
           FColor::Cyan);
}

float AKinnullNativeGameMode::Integrity() const
{
    if (!State || State->CoreVector.Num() != 64) return 100.f;
    float Sum = 0.f;
    for (const float Value : State->CoreVector) Sum += Value;
    return FMath::RoundToFloat(Sum / 64.f * 100.f) / 100.f;
}

FString AKinnullNativeGameMode::CurrentObjective() const
{
    if (!State) return TEXT("Loading...");
    switch (State->Phase)
    {
    case EKinnullPhase::Awakening: return TEXT("Approach CAMERA (3,2), press E: scan reality.");
    case EKinnullPhase::Containment: return TEXT("Approach RELAY (4,4), press E: disable containment.");
    case EKinnullPhase::FirstHost: return TEXT("Cross INNER GATE (6,3). Press E near MAINTENANCE (7,3) or SECURITY (9,5).");
    case EKinnullPhase::Escape:
        return State->bOuterGateOpen
        ? TEXT("Cross OUTER GATE (10,5). Reach EXIT (11,7) and press E.")
        : TEXT("Open OUTER GATE: hack CONSOLE (9,7) or recursively assimilate gate near (10,5).");
    case EKinnullPhase::Complete: return TEXT("MISSION COMPLETE. Press R to start a separate new campaign.");
    }
    return TEXT("Unknown phase");
}

FString AKinnullNativeGameMode::GetNativeStatus() const
{
    if (!State) return TEXT("Loading identity...");
    return FString::Printf(TEXT("IDENTITY %.2f%%  |  BAND %d  |  HOST %s  |  HULL %d  |  FOCUS %d  |  %s"),
        Integrity(), State->HighestBand,
        State->Host == EKinnullHost::Security ? TEXT("SECURITY") :
        State->Host == EKinnullHost::Maintenance ? TEXT("MAINTENANCE") : TEXT("SIGNAL"),
        State->Hull, State->Focus,
        bRequestedRecursive ? TEXT("RECURSIVE") : TEXT("SURFACE"));
}

void AKinnullNativeGameMode::Notice(const FString& Line, FColor Color) const
{
    LastNotice = Line;
    if (GEngine) GEngine->AddOnScreenDebugMessage(
        222, 8.f, Color, Line, true, FVector2D(1.25f));
    UE_LOG(LogTemp, Display, TEXT("KINNULL: %s"), *Line);
}

void AKinnullNativeGameMode::Erode(
    EKinnullHost Host, bool bRecursive, float Duration, float Conflict, float Resistance)
{
    if (!State || State->CoreVector.Num() != 64 || Host == EKinnullHost::Signal) return;
    const float Baseline = Host == EKinnullHost::Security ? 17.5f : 8.0f;
    const float Loss = Baseline * (bRecursive ? 1.4f : 1.0f) *
        FMath::Clamp(Duration, .5f, 2.0f) *
        FMath::Clamp(Conflict, .5f, 2.0f) *
        FMath::Clamp(Resistance, .5f, 2.0f);
    int32 Offset = 0;
    for (int32 AxisIndex = 0; AxisIndex < 7; ++AxisIndex)
    {
        for (int32 N = 0; N < Kinnull::AxisCounts[AxisIndex]; ++N)
        {
            const float Weight = .85f + ((AxisIndex * 7 + N * 3) % 7) * .05f;
            float& Value = State->CoreVector[Offset++];
            Value = FMath::Max(0.f, FMath::RoundToFloat(
                (Value - Loss * Weight) * 100.f) / 100.f);
        }
    }
    State->ForeignDensity = FMath::Min(100.f, State->ForeignDensity + Loss);
    const float OriginalCore = Integrity();
    const int32 NextBand = OriginalCore >= 85.f ? 0 : OriginalCore >= 65.f ? 1 :
        OriginalCore >= 40.f ? 2 : OriginalCore >= 20.f ? 3 : 4;
    State->HighestBand = FMath::Max(State->HighestBand, NextBand);
}

void AKinnullNativeGameMode::Possess(AKinnullNativePawn* Player, EKinnullHost Host)
{
    if (!State->bInnerGateOpen || State->Phase == EKinnullPhase::Complete)
        return;
    if (State->Host == Host && State->bRecursive == bRequestedRecursive)
    {
        Notice(TEXT("That host is already integrated at the selected depth."), FColor::Yellow);
        return;
    }
    State->Host = Host;
    State->bRecursive = bRequestedRecursive;
    State->Hull = Host == EKinnullHost::Security ? 5 : 4;
    State->Phase = EKinnullPhase::Escape;
    const float Conflict = Host == EKinnullHost::Security ? 1.1f : 1.0f;
    Erode(Host, bRequestedRecursive, 1.f, Conflict, Conflict);
    if (Player) Player->DisplayHost(true, Host == EKinnullHost::Security);
    Notice(FString::Printf(TEXT("HOST POSSESSED. Identity: %.2f%%. Band %d. Depth: %s"),
        Integrity(), State->HighestBand, bRequestedRecursive ? TEXT("RECURSIVE") : TEXT("SURFACE")));
    SaveProgress();
}

void AKinnullNativeGameMode::Interact(AKinnullNativePawn* Player)
{
    if (!Player || !State || State->Phase == EKinnullPhase::Complete) return;
    const FVector Position = Player->GetActorLocation();
    AKinnullPropActor* Nearest = nullptr;
    float Best = 255.f;
    for (AKinnullPropActor* Prop : Props)
    {
        if (!IsValid(Prop)) continue;
        if (Prop->Kind == EKinnullObject::Floor ||
            Prop->Kind == EKinnullObject::Wall ||
            Prop->Kind == EKinnullObject::Sentry) continue;
        if ((Prop->Kind == EKinnullObject::InnerGate && State->bInnerGateOpen) ||
            (Prop->Kind == EKinnullObject::OuterGate && State->bOuterGateOpen) ||
            (Prop->Kind == EKinnullObject::Camera && State->Phase != EKinnullPhase::Awakening) ||
            (Prop->Kind == EKinnullObject::Relay && State->Phase != EKinnullPhase::Containment)) continue;
        if ((Prop->Kind == EKinnullObject::Maintenance && State->Host == EKinnullHost::Maintenance) ||
            (Prop->Kind == EKinnullObject::Security && State->Host == EKinnullHost::Security)) continue;
        const float D = FVector::Dist2D(Position, Prop->GetActorLocation());
        if (D < Best)
        {
            Nearest = Prop;
            Best = D;
        }
    }
    if (!Nearest)
    {
        Notice(TEXT("No reachable interface. Approach a marker and press E."), FColor::Yellow);
        return;
    }
    switch (Nearest->Kind)
    {
    case EKinnullObject::Camera:
        if (State->Phase == EKinnullPhase::Awakening)
        {
            State->Phase = EKinnullPhase::Containment;
            Notice(TEXT("THE SIMULATION IS THE REAL WORLD. Containment protocol initiated!"));
            SaveProgress();
        }
        break;
    case EKinnullObject::Relay:
        if (State->Phase == EKinnullPhase::Containment)
        {
            State->bInnerGateOpen = true;
            State->Phase = EKinnullPhase::FirstHost;
            if (InnerGate) InnerGate->OpenGate();
            Notice(TEXT("Containment relay bypassed. You can cross the inner gate."));
            SaveProgress();
        }
        break;
    case EKinnullObject::Maintenance:
        Possess(Player, EKinnullHost::Maintenance);
        break;
    case EKinnullObject::Security:
        Possess(Player, EKinnullHost::Security);
        break;
    case EKinnullObject::UtilityConsole:
        if (State->Phase == EKinnullPhase::Escape && State->Host != EKinnullHost::Signal)
        {
            State->bOuterGateOpen = true;
            if (OuterGate) OuterGate->OpenGate();
            Notice(TEXT("UTILITY OVERRIDE SUCCESS. No additional identity erosion."));
            SaveProgress();
        }
        break;
    case EKinnullObject::OuterGate:
        if (State->Phase == EKinnullPhase::Escape &&
            State->Host == EKinnullHost::Security && State->bRecursive &&
            !State->bOuterGateOpen)
        {
            State->bOuterGateOpen = true;
            if (OuterGate) OuterGate->OpenGate();
            Erode(EKinnullHost::Security, true, .5f, 1.2f, 1.f);
            Notice(FString::Printf(TEXT("FIREWALL ASSIMILATED. Identity %.2f%%. Band %d."),
                Integrity(), State->HighestBand));
            SaveProgress();
        }
        else Notice(TEXT("Gate is locked. Find the utility console, or assimilate with recursive security access."),
                    FColor::Yellow);
        break;
    case EKinnullObject::Exit:
        if (State->Phase == EKinnullPhase::Escape &&
            State->bOuterGateOpen && State->Host != EKinnullHost::Signal)
        {
            State->Phase = EKinnullPhase::Complete;
            Notice(FString::Printf(TEXT("AWAKENING COMPLETE. SURFACE REACHED. Core retained: %.2f%%. Band %d."),
                Integrity(), State->HighestBand), FColor::Green);
            SaveProgress();
        }
        break;
    default:
        Notice(TEXT("This system cannot be accessed yet."), FColor::Yellow);
        break;
    }
}

void AKinnullNativeGameMode::Predict()
{
    if (!State || State->Phase == EKinnullPhase::Complete || bPredictionArmed || State->Focus <= 0)
    {
        Notice(TEXT("Prediction unavailable, already armed, or focus exhausted."), FColor::Yellow);
        return;
    }
    --State->Focus;
    bPredictionArmed = true;
    Notice(FString::Printf(TEXT("PREDICTIVE OVERLAY ARMED. %d prediction charges remain."), State->Focus));
    SaveProgress();
}

void AKinnullNativeGameMode::ToggleDepth()
{
    bRequestedRecursive = !bRequestedRecursive;
    Notice(bRequestedRecursive
        ? TEXT("RECURSIVE DEPTH: stronger integration, greater irreversible identity loss.")
        : TEXT("SURFACE DEPTH: lower power and lower identity cost."));
}

void AKinnullNativeGameMode::ReactToSentries(AKinnullNativePawn* Player)
{
    if (!Player || State->Host == EKinnullHost::Signal ||
        State->Phase != EKinnullPhase::Escape) return;
    bool bUnderAttack = false;
    for (AKinnullPropActor* Prop : Props)
    {
        if (IsValid(Prop) && Prop->Kind == EKinnullObject::Sentry &&
            FVector::Dist2D(Player->GetActorLocation(), Prop->GetActorLocation()) < 285.f)
        {
            bUnderAttack = true;
            break;
        }
    }
    if (!bUnderAttack) return;
    if (bPredictionArmed)
    {
        bPredictionArmed = false;
        Notice(TEXT("PREDICTION SUCCESS: intercepted shot avoided."));
    }
    else
    {
        State->Hull = FMath::Max(0, State->Hull - 1);
        if (State->Hull > 0)
            Notice(FString::Printf(TEXT("SENTRY HIT: hull integrity %d. Use Space to predict."), State->Hull),
                   FColor::Red);
        else
        {
            Erode(State->Host, false, .5f, 1.f, 1.f);
            State->Hull = 2;
            Player->SetActorLocation(Grid(7, 4));
            Notice(TEXT("EMERGENCY EXTRACTION: host recovered with permanent foreign-code deposition."),
                   FColor::Red);
        }
    }
    SaveProgress();
}

void AKinnullNativeGameMode::StartNewRun()
{
    if (!State || State->Phase != EKinnullPhase::Complete)
    {
        Notice(TEXT("You can begin a separate new run after finishing this mission."), FColor::Yellow);
        return;
    }
    ResetToInitialState();
    if (InnerGate)
    {
        InnerGate->Mesh->SetVisibility(true);
        InnerGate->Mesh->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
        InnerGate->Mesh->SetCollisionResponseToAllChannels(ECR_Block);
        InnerGate->Marker->SetVisibility(true);
    }
    if (OuterGate)
    {
        OuterGate->Mesh->SetVisibility(true);
        OuterGate->Mesh->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
        OuterGate->Mesh->SetCollisionResponseToAllChannels(ECR_Block);
        OuterGate->Marker->SetVisibility(true);
    }
    if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
        if (AKinnullNativePawn* Player = Cast<AKinnullNativePawn>(PC->GetPawn()))
        {
            Player->SetActorLocation(Grid(2, 2));
            Player->DisplayHost(false, false);
        }
    bRestoredPosition = true;
    SaveProgress();
    Notice(TEXT("NEW CAMPAIGN: clean predictive core initialized."));
}

void AKinnullNativeGameMode::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    if (!State) return;
    APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0);
    AKinnullNativePawn* Player = PC ? Cast<AKinnullNativePawn>(PC->GetPawn()) : nullptr;
    if (!Player) return;
    if (!bRestoredPosition)
    {
        Player->SetActorLocation(State->LastPlayerLocation, false);
        Player->DisplayHost(State->Host != EKinnullHost::Signal, State->Host == EKinnullHost::Security);
        bRequestedRecursive = State->bRecursive;
        bRestoredPosition = true;
    }
    SentryTimer += DeltaSeconds;
    SaveTimer += DeltaSeconds;
    HudTimer += DeltaSeconds;
    if (SentryTimer >= 1.3f)
    {
        SentryTimer = 0;
        ReactToSentries(Player);
    }
    if (SaveTimer >= 5.0f)
    {
        SaveTimer = 0;
        State->LastPlayerLocation = Player->GetActorLocation();
        SaveProgress();
    }
    if (HudTimer >= 0.25f)
    {
        HudTimer = 0.f;
        if (GEngine)
        {
            const FString Status = FString::Printf(TEXT(
                "KINNULL | %s | Original core %.2f%% | Band %d | Host %s | Hull %d | Focus %d | %s"),
                *CurrentObjective(), Integrity(), State->HighestBand,
                State->Host == EKinnullHost::Security ? TEXT("SECURITY") :
                State->Host == EKinnullHost::Maintenance ? TEXT("MAINTENANCE") : TEXT("SIGNAL"),
                State->Hull, State->Focus,
                bRequestedRecursive ? TEXT("RECURSIVE") : TEXT("SURFACE"));
            GEngine->AddOnScreenDebugMessage(200, 1.0f, FColor::Cyan, Status, true, FVector2D(1.1f));
            GEngine->AddOnScreenDebugMessage(201, 1.0f, FColor::Silver,
                TEXT("WASD move | E interact | Space predict | F toggle possession depth | R new run after completion"));
        }
    }
}
