import requests
import sys
import json
from datetime import datetime

class MeatInventoryAPITester:
    def __init__(self, base_url="https://meat-inventory.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_authentication(self):
        """Test user registration and login"""
        print("\n🔐 Testing Authentication...")
        
        # Test registration
        timestamp = datetime.now().strftime("%H%M%S")
        user_data = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": f"Test User {timestamp}"
        }
        
        response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if response and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            
            # Test login with same credentials
            login_data = {
                "username": user_data["username"],
                "password": user_data["password"]
            }
            
            login_response = self.run_test(
                "User Login",
                "POST",
                "auth/login",
                200,
                data=login_data
            )
            
            # Test get current user
            self.run_test(
                "Get Current User",
                "GET",
                "auth/me",
                200
            )
            
            return True
        
        return False

    def test_products(self):
        """Test product management"""
        print("\n📦 Testing Products...")
        
        # Create product
        product_data = {
            "name": "Test Chicken Breast",
            "category": "chicken",
            "description": "Fresh chicken breast",
            "unit": "kg",
            "price_per_unit": 250.0,
            "stock_quantity": 50.0,
            "reorder_level": 10.0,
            "sku": "CHK001"
        }
        
        product_response = self.run_test(
            "Create Product",
            "POST",
            "products",
            200,
            data=product_data
        )
        
        if product_response and 'id' in product_response:
            product_id = product_response['id']
            
            # Get all products
            self.run_test(
                "Get All Products",
                "GET",
                "products",
                200
            )
            
            # Get specific product
            self.run_test(
                "Get Product by ID",
                "GET",
                f"products/{product_id}",
                200
            )
            
            # Update product
            update_data = {**product_data, "price_per_unit": 275.0}
            self.run_test(
                "Update Product",
                "PUT",
                f"products/{product_id}",
                200,
                data=update_data
            )
            
            # Get low stock products
            self.run_test(
                "Get Low Stock Products",
                "GET",
                "products/low-stock/alert",
                200
            )
            
            return product_id
        
        return None

    def test_vendors(self):
        """Test vendor management"""
        print("\n🏪 Testing Vendors...")
        
        vendor_data = {
            "name": "Test Meat Supplier",
            "contact_person": "John Doe",
            "phone": "9876543210",
            "email": "supplier@example.com",
            "address": "123 Market Street"
        }
        
        vendor_response = self.run_test(
            "Create Vendor",
            "POST",
            "vendors",
            200,
            data=vendor_data
        )
        
        if vendor_response and 'id' in vendor_response:
            vendor_id = vendor_response['id']
            
            # Get all vendors
            self.run_test(
                "Get All Vendors",
                "GET",
                "vendors",
                200
            )
            
            # Update vendor
            update_data = {**vendor_data, "phone": "9876543211"}
            self.run_test(
                "Update Vendor",
                "PUT",
                f"vendors/{vendor_id}",
                200,
                data=update_data
            )
            
            return vendor_id
        
        return None

    def test_customers(self):
        """Test customer management"""
        print("\n👥 Testing Customers...")
        
        customer_data = {
            "name": "Test Customer",
            "phone": "9123456789",
            "email": "customer@example.com",
            "address": "456 Customer Lane"
        }
        
        customer_response = self.run_test(
            "Create Customer",
            "POST",
            "customers",
            200,
            data=customer_data
        )
        
        if customer_response and 'id' in customer_response:
            customer_id = customer_response['id']
            
            # Get all customers
            self.run_test(
                "Get All Customers",
                "GET",
                "customers",
                200
            )
            
            # Update customer
            update_data = {**customer_data, "phone": "9123456788"}
            self.run_test(
                "Update Customer",
                "PUT",
                f"customers/{customer_id}",
                200,
                data=update_data
            )
            
            return customer_id
        
        return None

    def test_sales(self, product_id, customer_id):
        """Test sales functionality"""
        print("\n💰 Testing Sales...")
        
        if not product_id:
            self.log_test("Sales Test", False, "No product available for sale")
            return None
        
        sale_data = {
            "customer_id": customer_id,
            "customer_name": "Test Customer",
            "items": [
                {
                    "product_id": product_id,
                    "product_name": "Test Chicken Breast",
                    "quantity": 2.0,
                    "unit": "kg",
                    "price_per_unit": 250.0,
                    "total": 500.0
                }
            ],
            "subtotal": 500.0,
            "tax": 25.0,
            "discount": 0.0,
            "total": 525.0,
            "payment_method": "cash"
        }
        
        sale_response = self.run_test(
            "Create Sale",
            "POST",
            "sales",
            200,
            data=sale_data
        )
        
        if sale_response and 'id' in sale_response:
            sale_id = sale_response['id']
            
            # Get all sales
            self.run_test(
                "Get All Sales",
                "GET",
                "sales",
                200
            )
            
            # Get specific sale
            self.run_test(
                "Get Sale by ID",
                "GET",
                f"sales/{sale_id}",
                200
            )
            
            return sale_id
        
        return None

    def test_dashboard(self):
        """Test dashboard stats"""
        print("\n📊 Testing Dashboard...")
        
        self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )

    def test_cleanup(self, product_id, vendor_id, customer_id):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        if product_id:
            self.run_test(
                "Delete Product",
                "DELETE",
                f"products/{product_id}",
                200
            )
        
        if vendor_id:
            self.run_test(
                "Delete Vendor",
                "DELETE",
                f"vendors/{vendor_id}",
                200
            )
        
        if customer_id:
            self.run_test(
                "Delete Customer",
                "DELETE",
                f"customers/{customer_id}",
                200
            )

    def run_all_tests(self):
        """Run complete test suite"""
        print(f"🚀 Starting Meat Inventory API Tests")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test authentication first
        if not self.test_authentication():
            print("❌ Authentication failed - stopping tests")
            return False
        
        # Test all modules
        product_id = self.test_products()
        vendor_id = self.test_vendors()
        customer_id = self.test_customers()
        sale_id = self.test_sales(product_id, customer_id)
        self.test_dashboard()
        
        # Clean up
        self.test_cleanup(product_id, vendor_id, customer_id)
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            return False

def main():
    tester = MeatInventoryAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())