#include "KinnullProceduralRig.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "UObject/UObjectGlobals.h"

UKinnullProceduralRig::UKinnullProceduralRig()
{
    PrimaryComponentTick.bCanEverTick = true;
    PrimaryComponentTick.TickInterval = 0.f;
}

USceneComponent* UKinnullProceduralRig::Joint(const FName& Name, const FVector& Location)
{
    USceneComponent* Node = NewObject<USceneComponent>(GetOwner(),
        MakeUniqueObjectName(GetOwner(), USceneComponent::StaticClass(), Name));
    Node->SetupAttachment(this);
    Node->SetRelativeLocation(Location);
    Node->RegisterComponent();
    return Node;
}

void UKinnullProceduralRig::AddPart(const TCHAR* Name, const TCHAR* Asset,
    USceneComponent* Parent, FVector Location, FVector Scale)
{
    UStaticMeshComponent* Mesh = NewObject<UStaticMeshComponent>(GetOwner(), FName(Name));
    if (UStaticMesh* Shape = LoadObject<UStaticMesh>(nullptr, Asset))
        Mesh->SetStaticMesh(Shape);
    Mesh->SetupAttachment(Parent ? Parent : this);
    Mesh->SetRelativeLocation(Location);
    Mesh->SetRelativeScale3D(Scale);
    Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Mesh->RegisterComponent();
    Parts.Add(Mesh);
}

void UKinnullProceduralRig::BeginPlay()
{
    Super::BeginPlay();
    BuildRig();
}
void UKinnullProceduralRig::SetRigRole(EKinnullRigRole NewRole)
{
    Role = NewRole;
    if (IsRegistered()) BuildRig();
}
void UKinnullProceduralRig::BuildRig()
{
    for (UStaticMeshComponent* Mesh : Parts)
        if (IsValid(Mesh)) Mesh->DestroyComponent();
    Parts.Empty();
    if (LeftJoint) LeftJoint->DestroyComponent();
    if (RightJoint) RightJoint->DestroyComponent();
    if (HeadJoint) HeadJoint->DestroyComponent();
    if (TailJoint) TailJoint->DestroyComponent();
    LeftJoint = Joint(TEXT("RigLeftJoint"), FVector(0,-45,20));
    RightJoint = Joint(TEXT("RigRightJoint"), FVector(0,45,20));
    HeadJoint = Joint(TEXT("RigHeadJoint"), FVector(0,0,120));
    TailJoint = Joint(TEXT("RigTailJoint"), FVector(-55,0,10));

    const TCHAR* Cube = TEXT("/Engine/BasicShapes/Cube.Cube");
    const TCHAR* Sphere = TEXT("/Engine/BasicShapes/Sphere.Sphere");
    const TCHAR* Cone = TEXT("/Engine/BasicShapes/Cone.Cone");
    const TCHAR* Cylinder = TEXT("/Engine/BasicShapes/Cylinder.Cylinder");
    switch (Role)
    {
    case EKinnullRigRole::PredictiveCore:
        AddPart(TEXT("CoreShell"), Sphere, this, FVector(0,0,80), FVector(.65));
        AddPart(TEXT("ForecastHalo"), Cylinder, HeadJoint, FVector::ZeroVector, FVector(1.3,1.3,.07));
        AddPart(TEXT("CoreForkLeft"), Cone, LeftJoint, FVector(0,0,40), FVector(.2,.2,.7));
        AddPart(TEXT("CoreForkRight"), Cone, RightJoint, FVector(0,0,40), FVector(.2,.2,.7));
        break;
    case EKinnullRigRole::MaintenanceCrawler:
        AddPart(TEXT("CrawlerChassis"), Cube, this, FVector(0,0,60), FVector(1.1,.65,.4));
        AddPart(TEXT("CrawlerSensor"), Sphere, HeadJoint, FVector(40,0,-10), FVector(.35));
        AddPart(TEXT("CrawlerLeftArm"), Cylinder, LeftJoint, FVector(0,0,-35), FVector(.2,.2,1));
        AddPart(TEXT("CrawlerRightArm"), Cylinder, RightJoint, FVector(0,0,-35), FVector(.2,.2,1));
        AddPart(TEXT("CrawlerTool"), Cone, TailJoint, FVector(-20,0,20), FVector(.4,.4,.7));
        break;
    case EKinnullRigRole::SecuritySentinel:
    case EKinnullRigRole::DroneSoldier:
        AddPart(TEXT("ArmorTorso"), Cube, this, FVector(0,0,85), FVector(.85,.68,1.0));
        AddPart(TEXT("ThreatOptic"), Sphere, HeadJoint, FVector(0,0,25), FVector(.43));
        AddPart(TEXT("WeaponLeft"), Cylinder, LeftJoint, FVector(35,0,-10), FVector(.2,.2,.85));
        AddPart(TEXT("WeaponRight"), Cylinder, RightJoint, FVector(35,0,-10), FVector(.2,.2,.85));
        AddPart(TEXT("Thruster"), Cylinder, TailJoint, FVector(-30,0,0), FVector(.32,.32,.75));
        break;
    case EKinnullRigRole::CorporateHandler:
        AddPart(TEXT("HandlerBody"), Cylinder, this, FVector(0,0,84), FVector(.56,.56,1.1));
        AddPart(TEXT("HandlerHead"), Sphere, HeadJoint, FVector(0,0,30), FVector(.40));
        AddPart(TEXT("HandlerLeftArm"), Cylinder, LeftJoint, FVector(0,0,-45), FVector(.15,.15,.85));
        AddPart(TEXT("HandlerRightArm"), Cylinder, RightJoint, FVector(0,0,-45), FVector(.15,.15,.85));
        break;
    case EKinnullRigRole::NaniteDragon:
        AddPart(TEXT("DragonThorax"), Sphere, this, FVector(0,0,90), FVector(1.25,.7,.7));
        AddPart(TEXT("DragonHead"), Cone, HeadJoint, FVector(55,0,20), FVector(.55,.65,1.1));
        AddPart(TEXT("DragonWingLeft"), Cube, LeftJoint, FVector(0,-105,60), FVector(.25,2.3,.06));
        AddPart(TEXT("DragonWingRight"), Cube, RightJoint, FVector(0,105,60), FVector(.25,2.3,.06));
        AddPart(TEXT("DragonTail"), Cone, TailJoint, FVector(-85,0,0), FVector(.4,.4,1.6));
        break;
    }
}
void UKinnullProceduralRig::TriggerPossession() { PossessionTime = 1.5f; }
void UKinnullProceduralRig::TriggerAttack() { AttackTime = .55f; }
void UKinnullProceduralRig::TriggerHit() { HitTime = .3f; }
void UKinnullProceduralRig::TickComponent(float DeltaTime, ELevelTick TickType,
    FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
    RunningTime += DeltaTime;
    PossessionTime = FMath::Max(0.f, PossessionTime - DeltaTime);
    AttackTime = FMath::Max(0.f, AttackTime - DeltaTime);
    HitTime = FMath::Max(0.f, HitTime - DeltaTime);
    const float Pulse = FMath::Sin(RunningTime * 3.f);
    const float Stress = HitTime > 0.f ? FMath::Sin(RunningTime * 70.f) * 22.f : 0.f;
    SetRelativeLocation(FVector(0, Stress, Pulse * 4.f));
    const float AttackSwing = AttackTime > 0.f ? FMath::Sin((.55f - AttackTime) * 10.f) * 48.f : 0.f;
    if (LeftJoint) LeftJoint->SetRelativeRotation(FRotator(AttackSwing + Pulse * 6.f,0,0));
    if (RightJoint) RightJoint->SetRelativeRotation(FRotator(-AttackSwing - Pulse * 6.f,0,0));
    if (HeadJoint) HeadJoint->SetRelativeRotation(FRotator(Pulse * 3.f, 0, Pulse * 4.f));
    if (TailJoint) TailJoint->SetRelativeRotation(FRotator(0,0,Pulse * 12.f));
    if (PossessionTime > 0.f)
        SetRelativeScale3D(FVector(1.f + .18f * FMath::Sin(PossessionTime * 19.f)));
    else SetRelativeScale3D(FVector::OneVector);
}
