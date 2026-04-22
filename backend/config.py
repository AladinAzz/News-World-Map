import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
    RSS_FEEDS = [
        "https://news.google.com/rss?hl=fr-DZ&gl=DZ&ceid=DZ:fr",
        "https://www.tsa-algerie.com/feed/",
        "https://www.aps.dz/algerie?format=feed&type=rss",
        "https://allafrica.com/tools/headlines/feeds/algeria.xml",
        "https://www.algerie-eco.com/feed/",
        "https://www.algerie360.com/feed/",
        "https://www.echoroukonline.com/feed/"
    ]
    CACHE_TTL = 1200  # 20 minutes in seconds
    MAX_EVENTS = 100
    MEDITERRANEAN = [15.0, 35.0]
    
    # Wilayas of Algeria (58)
    WILAYAS = [
        "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
        "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
        "Skikda", "Sidi Bel Abbès", "An naba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
        "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
        "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar",
        "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
    ]
