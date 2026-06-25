# Chord Progressions — How to Add/Edit

## Option 1: Edit `progressions.json` directly (simplest)

Open `progressions.json` in the project root and edit the JSON directly.

Format:
```json
{
  "major:triads": [
    { "label": "vi – IV – I – V", "romans": ["vi", "IV", "I", "V"] }
  ],
  "minor:triads": [...],
  "major:sevenths": [...],
  "minor:sevenths": [...]
}
```

The four sections are:
- `major:triads`
- `minor:triads`
- `major:sevenths`
- `minor:sevenths`

Each entry is `{ "label": "...", "romans": ["I", "IV", ...] }`.

## Option 2: Use the in-app editor + export

1. Open the app → **Progressions Catalog** → click **Edit**
2. Add/reorder/delete progressions and chords
3. Click **Export JSON** → **Copy to clipboard**
4. Paste the copied JSON into `progressions.json` in the project root
5. Rebuild and deploy

## Option 3: Use the in-app editor for temporary changes

Edits made in the app (via Edit → Save) persist only for the current session.
They are lost on page refresh. Use Option 2 to make them permanent.

## After editing

Run `npm run build` and deploy. The app imports progressions from `progressions.json` at build time.
