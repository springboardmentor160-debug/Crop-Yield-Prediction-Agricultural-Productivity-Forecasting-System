Trained model artifacts (yield_model.joblib) and metrics.json are generated
here automatically by running:

    python -m app.ml.train

or on first prediction request if no artifact exists yet. This directory is
intentionally empty in the repository so the trained model always reflects
the current codebase.
