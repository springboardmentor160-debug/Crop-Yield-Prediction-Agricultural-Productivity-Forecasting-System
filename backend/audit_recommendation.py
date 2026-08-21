import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

df = pd.read_csv("data/raw/crop_recommendation.csv")
print("Records:", len(df))
print("Classes:", df['label'].nunique())
print("Duplicates:", df.duplicated().sum())

# Check if there are overlapping duplicates between train and test
X = df.drop('label', axis=1)
y = df['label']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

train_df = pd.concat([X_train, y_train], axis=1)
test_df = pd.concat([X_test, y_test], axis=1)

# Inner merge to find exact duplicates between train and test
overlap = pd.merge(train_df, test_df, how='inner')
print("Overlapping exact duplicates between train/test:", len(overlap))

# Feature distributions to see if they are highly synthetic
print("Feature Stats:\n", X.describe().T[['mean', 'std', 'min', 'max']])

# Run evaluation to produce F1 and confusion matrix
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print("\nClassification Report:\n", classification_report(y_test, y_pred))
