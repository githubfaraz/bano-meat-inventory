# NEW MODELS AND ENDPOINTS FOR MEAT SHOP INVENTORY SYSTEM
# This will be integrated into server.py

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid

# ========== NEW MODELS ==========

class MainCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class MainCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DerivedProductCreate(BaseModel):
    main_category_id: str
    name: str
    sku: str
    selling_price: float
    description: Optional[str] = None

class DerivedProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    main_category_id: str
    name: str
    sku: str
    selling_price: float
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InventoryPurchaseCreate(BaseModel):
    main_category_id: str
    vendor_id: str
    total_weight_kg: float
    total_pieces: Optional[int] = None
    cost_per_kg: float
    notes: Optional[str] = None

class InventoryPurchase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    main_category_id: str
    vendor_id: str
    purchase_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_weight_kg: float
    total_pieces: Optional[int] = None
    remaining_weight_kg: float
    remaining_pieces: Optional[int] = None
    cost_per_kg: float
    total_cost: float
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DailyPiecesTrackingCreate(BaseModel):
    main_category_id: str
    pieces_sold: int
    date: Optional[datetime] = None

class DailyPiecesTracking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    main_category_id: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    pieces_sold: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class POSSaleItemNew(BaseModel):
    derived_product_id: str
    derived_product_name: str
    main_category_id: str
    quantity_kg: float
    selling_price: float
    total: float

class POSSaleCreateNew(BaseModel):
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    items: List[POSSaleItemNew]
    subtotal: float
    tax: float
    discount: float
    total: float
    payment_method: str

class InventorySummary(BaseModel):
    main_category_id: str
    main_category_name: str
    total_weight_kg: float
    total_pieces: int
    total_purchases: int
