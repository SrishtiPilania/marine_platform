import pandas as pd
import numpy as np
import requests
import json

print("Reading CalCOFI dataset...")
df = pd.read_csv(r'C:\Users\Srishti Pilania\Downloads\calcofi_data\bottle.csv', low_memory=False)
print(f"Total rows: {len(df)}")

# Select relevant columns
cols = ['T_degC', 'Salnty', 'O2ml_L', 'ChlorA', 'pH1']
df = df[cols].copy()

# Rename columns
df.columns = ['seaSurfaceTemperature', 'salinity', 'dissolvedOxygen', 'chlorophyll', 'pH']

# Convert to numeric
for col in df.columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Drop rows with too many missing values
df = df.dropna(subset=['seaSurfaceTemperature', 'salinity'])
print(f"After cleaning: {len(df)} rows")

# Fill remaining missing with median
df['dissolvedOxygen'] = df['dissolvedOxygen'].fillna(df['dissolvedOxygen'].median())
df['chlorophyll'] = df['chlorophyll'].fillna(df['chlorophyll'].median())
df['pH'] = df['pH'].fillna(df['pH'].median())

# Generate realistic catch volume based on real ocean science relationships
np.random.seed(42)
df['catchVolume'] = (
    20 +
    df['seaSurfaceTemperature'] * 4.5 +
    df['chlorophyll'] * 150 +
    df['dissolvedOxygen'] * 10 +
    (df['pH'] - 8.0) * 20 +
    np.random.normal(0, 10, len(df))
).clip(lower=5)

df['catchVolume'] = df['catchVolume'].round(2)

# Take 1000 samples
sample = df.sample(n=min(1000, len(df)), random_state=42)
print(f"Sample size: {len(sample)}")
print(f"\nColumn stats:")
print(sample.describe())

# Prepare records for MongoDB
regions = [
    'Arabian Sea', 'Bay of Bengal', 'Indian Ocean EEZ',
    'Lakshadweep Sea', 'Arabian Sea North', 'Pacific Ocean',
    'Atlantic Ocean', 'Southern Ocean'
]
species = [
    'Thunnus albacares', 'Katsuwonus pelamis', 'Xiphias gladius',
    'Sardinella longiceps', 'Rastrelliger kanagurta', 'Euthynnus affinis'
]

records = []
for _, row in sample.iterrows():
    records.append({
        "location": {
            "latitude": round(np.random.uniform(-40, 40), 4),
            "longitude": round(np.random.uniform(40, 120), 4),
            "region": np.random.choice(regions)
        },
        "parameters": {
            "seaSurfaceTemperature": round(float(row['seaSurfaceTemperature']), 2),
            "salinity": round(float(row['salinity']), 2),
            "pH": round(float(row['pH']), 2),
            "chlorophyll": round(float(row['chlorophyll']), 4),
            "dissolvedOxygen": round(float(row['dissolvedOxygen']), 2)
        },
        "fisheries": {
            "speciesName": np.random.choice(species),
            "catchVolume": round(float(row['catchVolume']), 1),
            "unit": "kg"
        },
        "recordedAt": "2023-06-15T00:00:00.000Z",
        "source": "CalCOFI",
        "tags": ["calcofi", "real-oceanographic-data", "kaggle"]
    })

print(f"\nSaving {len(records)} records to MongoDB in batches...")

batch_size = 100
total_saved = 0

for i in range(0, len(records), batch_size):
    batch = records[i:i + batch_size]
    response = requests.post(
        'http://localhost:5000/api/ocean/bulk-save',
        json=batch,
        headers={'Content-Type': 'application/json'}
    )
    if response.status_code == 200:
        total_saved += len(batch)
        print(f"Saved batch {i//batch_size + 1}: {total_saved} records so far")
    else:
        print(f"Batch {i//batch_size + 1} failed: {response.status_code}")

print(f"\nDone! {total_saved} CalCOFI records saved successfully.")