import unittest
from howest_resto import HowestRestoClient, CAMPUSES


class TestHowestRestoClient(unittest.TestCase):
    def setUp(self):
        self.client = HowestRestoClient()

    def test_campuses(self):
        campuses = self.client.get_campuses()
        self.assertGreaterEqual(len(campuses), 6)
        codes = [c.code for c in campuses]
        self.assertIn("GKG", codes)
        self.assertIn("RSS", codes)

    def test_invalid_campus(self):
        with self.assertRaises(ValueError):
            self.client.get_menu(campus="NONEXISTENT")


if __name__ == "__main__":
    unittest.main()
