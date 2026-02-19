# Massive Detailed Plan: Product Management Reconstruction

## 1. Objectives
- **Flexible Categories:** Allow assigning multiple categories to a single product.
- **Simplified Pricing:** "Selling Price" (Sale) must be inactive if 0/Empty.
- **Streamlined UI:** Remove "Technical Details" (Ratings, Concentration) but keep "Target Audience/Gender".
- **Default Variant:** Ensure every product has a default variant (original size) easily added without repetitive "Add Variant" steps.

## 2. Backend Architecture Changes

### A. Models (`products/models.py`)
1.  **Relationship Update:**
    -   Change `Product.category` (ForeignKey) to `Product.categories` (ManyToManyField).
    -   *Migration Strategy:* Create new `categories` field, copy existing `category` data to it, then remove `category`.
2.  **Cleanup:**
    -   Remove `longevity_rating`, `sillage_rating`, `concentration` if they are no longer needed in the UI. (User said remove "Technical Details", usually implies removing the fields too to clean up DB). **Decision:** I will keep them in model for now but hide in admin to avoid data loss unless user explicitly confirms, but for "Reconstruct" I will hide them.
    -   *Wait*, user said "reconstruct the adding page". I will just remove them from the serializer/view.

### B. Serializers (`products/serializers.py`)
1.  **ProductSerializer:**
    -   Field `categories`: List of IDs (Write), Nested objects (Read).
    -   Remove `category` field.
2.  **ProductVariantSerializer:**
    -   Logic to handle `sale_price`: If `0` or `null` is received, ensure it is saved as `null` in DB so the logic `if sale_price` works correctly.

### C. Views (`products/views.py`)
1.  **AdminProductViewSet:**
    -   Adapt to M2M `categories` save logic (DRF `ModelSerializer` handles M2M mostly automatically).

## 3. Frontend Reconstruction (`ProductEdit.jsx`)

### A. Layout Restructuring
-   **Section 1: Basic Information**
    -   Name (Ar/En), Slug.
    -   Description, Story.
    -   **Images:** moved here or kept adjacent.
-   **Section 2: Classification**
    -   **Brand:** Single Select.
    -   **Categories:** **Multi-Select Component**.
    -   **Gender:** "لمن هذا العطر؟" (Moved from Technical Details).
-   **Section 3: Pricing & Inventory (The "Default" Logic)**
    -   Instead of a separate "Variants" tab initially:
    -   **On Create:** Show inputs for "Base Price", "Sale Price (Optional)", "Stock", "SKU".
    -   **On Save:** Create the Product AND the first "Default Variant" automatically.
    -   **On Edit:** Show the list of variants. Allow adding more.

### B. "Technical Details" Removal
-   Remove UI for Longevity, Sillage, Concentration.
-   **Preserve:** Gender ("لمن هذا العطر؟").

### C. Pricing Logic
-   **Sale Price Input:**
    -   If user clears the input or types `0`, send `null` to backend.
    -   Visual indicator: "Sale Inactive" if empty.

## 4. Implementation Steps
1.  **Database Migration (Critical):**
    -   Rename/Migrate `category` to `categories`.
2.  **Backend Code Update:**
    -   Models, Serializers, Views.
3.  **Frontend Logic:**
    -   Build `ProductEdit.jsx` from scratch (or heavy refactor) to support the new "Single Page" creation flow (Product + Default Variant).
4.  **Verification:**
    -   Create Product with 0 Sale Price -> Check Display.
    -   Create Product with Multiple Categories.
    -   Verify Gender selection works.

