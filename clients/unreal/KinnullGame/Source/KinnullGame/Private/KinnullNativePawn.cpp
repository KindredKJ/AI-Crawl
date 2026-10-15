#include "KinnullNativePawn.h"
#include "KinnullNativeGameMode.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/InputComponent.h"
#include "Components/StaticMeshComponent.h"
#include "GameFramework/FloatingPawnMovement.h"
#include "GameFramework/SpringArmComponent.h"
#include "UObject/ConstructorHelpers.h"

AKinnullNativePawn::AKinnullNativePawn()
{
    PrimaryActorTick.bCanEverTick = false;
    AutoPossessPlayer = EAutoReceiveInput::Player0;
    Capsule = CreateDefaultSubobject<UCapsuleComponent>(TEXT("PlayerCollision"));
    Capsule->InitCapsuleSize(42.f, 82.f);
    Capsule->SetCollisionProfileName(TEXT("Pawn"));
    SetRootComponent(Capsule);

    Body = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("VisibleAvatar"));
    Body->SetupAttachment(Capsule);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Sphere(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    if (Sphere.Succeeded()) Body->SetStaticMesh(Sphere.Object);
    Body->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Body->SetRelativeScale3D(FVector(0.6f));

    Boom = CreateDefaultSubobject<USpringArmComponent>(TEXT("TacticalCameraArm"));
    Boom->SetupAttachment(Capsule);
    Boom->TargetArmLength = 800.0f;
    Boom->bDoCollisionTest = false;
    Boom->SetRelativeRotation(FRotator(-63.0f, 0.f, 0.f));

    Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("TacticalCamera"));
    Camera->SetupAttachment(Boom, USpringArmComponent::SocketName);
    Movement = CreateDefaultSubobject<UFloatingPawnMovement>(TEXT("Movement"));
    Movement->MaxSpeed = 470.0f;
    Movement->Acceleration = 2200.0f;
    Movement->Deceleration = 2700.0f;
}

void AKinnullNativePawn::SetupPlayerInputComponent(UInputComponent* Input)
{
    Super::SetupPlayerInputComponent(Input);
    Input->BindAxis(TEXT("MoveForward"), this, &AKinnullNativePawn::Forward);
    Input->BindAxis(TEXT("MoveRight"), this, &AKinnullNativePawn::Right);
    Input->BindAction(TEXT("Interact"), IE_Pressed, this, &AKinnullNativePawn::Interact);
    Input->BindAction(TEXT("Predict"), IE_Pressed, this, &AKinnullNativePawn::Predict);
    Input->BindAction(TEXT("ToggleDepth"), IE_Pressed, this, &AKinnullNativePawn::ToggleDepth);
    Input->BindAction(TEXT("NewRun"), IE_Pressed, this, &AKinnullNativePawn::NewRun);
}

void AKinnullNativePawn::Forward(float Axis) { AddMovementInput(FVector::ForwardVector, Axis); }
void AKinnullNativePawn::Right(float Axis) { AddMovementInput(FVector::RightVector, Axis); }
void AKinnullNativePawn::Interact()
{
    if (AKinnullNativeGameMode* GM = GetWorld()->GetAuthGameMode<AKinnullNativeGameMode>())
        GM->Interact(this);
}
void AKinnullNativePawn::Predict()
{
    if (AKinnullNativeGameMode* GM = GetWorld()->GetAuthGameMode<AKinnullNativeGameMode>())
        GM->Predict();
}
void AKinnullNativePawn::ToggleDepth()
{
    if (AKinnullNativeGameMode* GM = GetWorld()->GetAuthGameMode<AKinnullNativeGameMode>())
        GM->ToggleDepth();
}
void AKinnullNativePawn::NewRun()
{
    if (AKinnullNativeGameMode* GM = GetWorld()->GetAuthGameMode<AKinnullNativeGameMode>())
        GM->StartNewRun();
}
void AKinnullNativePawn::DisplayHost(bool bHasBody, bool bSecurity)
{
    Body->SetRelativeScale3D(FVector(bHasBody ? (bSecurity ? 1.05f : 0.85f) : 0.40f));
    Movement->MaxSpeed = bSecurity ? 580.f : (bHasBody ? 445.f : 470.f);
}
