from ml.model_loader import get_yield_model


def main() -> None:
    print("=" * 70)
    print("YieldSense AI - Production Model Loading Test")
    print("=" * 70)

    model_bundle = get_yield_model()

    print()
    print(
        f"Model Name    : "
        f"{model_bundle.model_name}"
    )

    print(
        f"Model Version : "
        f"{model_bundle.model_version}"
    )

    print(
        f"Feature Count : "
        f"{len(model_bundle.features)}"
    )

    print()
    print("Features")

    for feature in model_bundle.features:
        print(f"- {feature}")

    print()
    print(
        "Production model loaded successfully."
    )


if __name__ == "__main__":
    main()