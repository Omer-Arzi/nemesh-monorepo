export type SeedItem = {
  canonicalName: string;
  slug: string;
  variants: string[];
  approvalStatus: 'approved' | 'pending';
};

export const ingredients: SeedItem[] = [
  { canonicalName: 'קמח',         slug: 'flour',         variants: ['קמח', 'flour'],                                                        approvalStatus: 'approved' },
  { canonicalName: 'סוכר',        slug: 'sugar',         variants: ['סוכר', 'sugar'],                                                       approvalStatus: 'approved' },
  { canonicalName: 'מלח',         slug: 'salt',          variants: ['מלח', 'salt'],                                                         approvalStatus: 'approved' },
  { canonicalName: 'ביצה',        slug: 'egg',           variants: ['ביצה', 'ביצים', 'egg', 'eggs'],                                        approvalStatus: 'approved' },
  { canonicalName: 'חלב',         slug: 'milk',          variants: ['חלב', 'milk'],                                                         approvalStatus: 'approved' },
  { canonicalName: 'חמאה',        slug: 'butter',        variants: ['חמאה', 'butter'],                                                      approvalStatus: 'approved' },
  { canonicalName: 'שמן זית',     slug: 'olive-oil',     variants: ['שמן זית', 'olive oil', 'olive-oil'],                                   approvalStatus: 'approved' },
  { canonicalName: 'שמן',         slug: 'oil',           variants: ['שמן', 'oil'],                                                          approvalStatus: 'approved' },
  { canonicalName: 'מים',         slug: 'water',         variants: ['מים', 'water'],                                                        approvalStatus: 'approved' },
  { canonicalName: 'שום',         slug: 'garlic',        variants: ['שום', 'garlic'],                                                       approvalStatus: 'approved' },
  { canonicalName: 'בצל',         slug: 'onion',         variants: ['בצל', 'onion'],                                                        approvalStatus: 'approved' },
  { canonicalName: 'עגבנייה',     slug: 'tomato',        variants: ['עגבניה', 'עגבנייה', 'tomato', 'tomatoes', 'עגבניות', 'עגבניות שרי'],  approvalStatus: 'approved' },
  { canonicalName: 'מלפפון',      slug: 'cucumber',      variants: ['מלפפון', 'cucumber'],                                                  approvalStatus: 'approved' },
  { canonicalName: 'גזר',         slug: 'carrot',        variants: ['גזר', 'carrot', 'גזרים'],                                              approvalStatus: 'approved' },
  { canonicalName: 'תפוח אדמה',  slug: 'potato',        variants: ['תפוח אדמה', 'תפוחי אדמה', 'potato', 'potatoes'],                      approvalStatus: 'approved' },
  { canonicalName: 'בטטה',        slug: 'sweet-potato',  variants: ['בטטה', 'sweet potato', 'sweet-potato'],                               approvalStatus: 'approved' },
  { canonicalName: 'אורז',        slug: 'rice',          variants: ['אורז', 'rice'],                                                        approvalStatus: 'approved' },
  { canonicalName: 'פסטה',        slug: 'pasta',         variants: ['פסטה', 'pasta'],                                                       approvalStatus: 'approved' },
  { canonicalName: 'גבינה',       slug: 'cheese',        variants: ['גבינה', 'cheese'],                                                     approvalStatus: 'approved' },
  { canonicalName: 'גבינת מוצרלה', slug: 'mozzarella',  variants: ['מוצרלה', 'גבינת מוצרלה', 'mozzarella'],                               approvalStatus: 'approved' },

  // Spices & herbs
  { canonicalName: 'פלפל שחור',    slug: 'blackpepper',   variants: ['פלפל שחור', 'פלפלים שחורים', 'black pepper', 'black peppers', 'ground black pepper', 'pepper'],             approvalStatus: 'approved' },
  { canonicalName: 'פלפל',         slug: 'pepper',        variants: ['פלפל', 'פלפלים', 'pepper', 'peppers', 'bell pepper', 'bell peppers'],                                       approvalStatus: 'approved' },
  { canonicalName: 'פלפל אדום',    slug: 'redpepper',     variants: ['פלפל אדום', 'פלפלים אדומים', 'red pepper', 'red peppers', 'red bell pepper', 'red bell peppers'],           approvalStatus: 'approved' },
  { canonicalName: 'פלפל ירוק',    slug: 'greenpepper',   variants: ['פלפל ירוק', 'פלפלים ירוקים', 'green pepper', 'green peppers', 'green bell pepper', 'green bell peppers'],   approvalStatus: 'approved' },
  { canonicalName: 'פלפל צהוב',    slug: 'yellowpepper',  variants: ['פלפל צהוב', 'פלפלים צהובים', 'yellow pepper', 'yellow peppers', 'yellow bell pepper', 'yellow bell peppers'], approvalStatus: 'approved' },
  { canonicalName: 'פלפל חריף',    slug: 'hotpepper',     variants: ['פלפל חריף', 'פלפלים חריפים', 'hot pepper', 'hot peppers', 'chili pepper', 'chili peppers', 'chilli pepper', 'chilli peppers'], approvalStatus: 'approved' },
  { canonicalName: 'פפריקה',       slug: 'paprika',       variants: ['פפריקה', 'paprika', 'sweet paprika', 'smoked paprika'],                                                      approvalStatus: 'approved' },
  { canonicalName: 'כמון',         slug: 'cumin',         variants: ['כמון', 'cumin', 'ground cumin'],                                                                             approvalStatus: 'approved' },
  { canonicalName: 'כורכום',       slug: 'turmeric',      variants: ['כורכום', 'turmeric', 'ground turmeric'],                                                                     approvalStatus: 'approved' },
  { canonicalName: 'קינמון',       slug: 'cinnamon',      variants: ['קינמון', 'cinnamon', 'ground cinnamon'],                                                                     approvalStatus: 'approved' },
  { canonicalName: 'זעתר',         slug: 'zaatar',        variants: ['זעתר', 'zaatar', "za'atar"],                                                                                 approvalStatus: 'approved' },
  { canonicalName: 'אורגנו',       slug: 'oregano',       variants: ['אורגנו', 'oregano', 'dried oregano'],                                                                        approvalStatus: 'approved' },
  { canonicalName: 'בזיליקום',     slug: 'basil',         variants: ['בזיליקום', 'עלי בזיליקום', 'basil', 'basil leaves'],                                                        approvalStatus: 'approved' },
  { canonicalName: 'פטרוזיליה',    slug: 'parsley',       variants: ['פטרוזיליה', 'עלי פטרוזיליה', 'parsley', 'parsleys', 'parsley leaves'],                                      approvalStatus: 'approved' },
  { canonicalName: 'כוסברה',       slug: 'cilantro',      variants: ['כוסברה', 'עלי כוסברה', 'cilantro', 'cilantros', 'coriander leaves'],                                        approvalStatus: 'approved' },
  { canonicalName: 'נענע',         slug: 'mint',          variants: ['נענע', 'עלי נענע', 'mint', 'mint leaves'],                                                                   approvalStatus: 'approved' },
  { canonicalName: 'שמיר',         slug: 'dill',          variants: ['שמיר', 'dill', 'dill leaves'],                                                                               approvalStatus: 'approved' },

  // Acids & condiments
  { canonicalName: 'לימון',        slug: 'lemon',         variants: ['לימון', 'לימונים', 'lemon', 'lemons', 'lemon juice'],                                                       approvalStatus: 'approved' },
  { canonicalName: 'ליים',         slug: 'lime',          variants: ['ליים', 'ליימים', 'lime', 'limes', 'lime juice'],                                                             approvalStatus: 'approved' },
  { canonicalName: 'חומץ',         slug: 'vinegar',       variants: ['חומץ', 'vinegar', 'white vinegar', 'vinegars'],                                                              approvalStatus: 'approved' },
  { canonicalName: 'חומץ בלסמי',  slug: 'balsamicvinegar', variants: ['חומץ בלסמי', 'בלסמי', 'balsamic vinegar', 'balsamic'],                                                    approvalStatus: 'approved' },
  { canonicalName: 'סויה',         slug: 'soysauce',      variants: ['סויה', 'רוטב סויה', 'soy sauce', 'soya sauce'],                                                             approvalStatus: 'approved' },
  { canonicalName: 'דבש',          slug: 'honey',         variants: ['דבש', 'honey'],                                                                                              approvalStatus: 'approved' },
  { canonicalName: 'סילאן',        slug: 'datesyrup',     variants: ['סילאן', 'דבש תמרים', 'date syrup', 'dates syrup'],                                                          approvalStatus: 'approved' },
  { canonicalName: 'מייפל',        slug: 'maplesyrup',    variants: ['מייפל', 'סירופ מייפל', 'maple syrup', 'maple'],                                                              approvalStatus: 'approved' },

  // Baking
  { canonicalName: 'אבקת אפייה',  slug: 'bakingpowder',  variants: ['אבקת אפייה', 'אבקות אפייה', 'baking powder', 'baking powders'],                                             approvalStatus: 'approved' },
  { canonicalName: 'סודה לשתייה', slug: 'bakingsoda',    variants: ['סודה לשתייה', 'סודה לאפייה', 'baking soda', 'bicarbonate of soda'],                                         approvalStatus: 'approved' },
  { canonicalName: 'שמרים',        slug: 'yeast',         variants: ['שמרים', 'שמרים יבשים', 'yeast', 'dry yeast', 'instant yeast'],                                              approvalStatus: 'approved' },
  { canonicalName: 'וניל',         slug: 'vanilla',       variants: ['וניל', 'vanilla', 'vanilla extract', 'תמצית וניל'],                                                         approvalStatus: 'approved' },
  { canonicalName: 'קקאו',         slug: 'cocoa',         variants: ['קקאו', 'אבקת קקאו', 'cocoa', 'cocoa powder'],                                                                approvalStatus: 'approved' },

  // Chocolate
  { canonicalName: 'שוקולד',       slug: 'chocolate',     variants: ['שוקולד', 'שוקולדים', 'chocolate', 'chocolates'],                                                            approvalStatus: 'approved' },
  { canonicalName: 'שוקולד מריר', slug: 'darkchocolate', variants: ['שוקולד מריר', 'dark chocolate', 'dark chocolates', 'bittersweet chocolate'],                                 approvalStatus: 'approved' },
  { canonicalName: 'שוקולד חלב',  slug: 'milkchocolate', variants: ['שוקולד חלב', 'milk chocolate', 'milk chocolates'],                                                           approvalStatus: 'approved' },
  { canonicalName: 'שוקולד לבן',  slug: 'whitechocolate', variants: ['שוקולד לבן', 'white chocolate', 'white chocolates'],                                                        approvalStatus: 'approved' },

  // Beverages
  { canonicalName: 'קפה',          slug: 'coffee',        variants: ['קפה', 'coffee', 'ground coffee', 'instant coffee'],                                                          approvalStatus: 'approved' },
  { canonicalName: 'תה',           slug: 'tea',           variants: ['תה', 'tea', 'tea bags'],                                                                                     approvalStatus: 'approved' },

  // Dairy
  { canonicalName: 'יוגורט',       slug: 'yogurt',        variants: ['יוגורט', 'יוגורטים', 'yogurt', 'yogurts', 'yoghurt', 'yoghurts'],                                           approvalStatus: 'approved' },
  { canonicalName: 'שמנת מתוקה',  slug: 'heavycream',    variants: ['שמנת מתוקה', 'שמנת להקצפה', 'heavy cream', 'whipping cream'],                                               approvalStatus: 'approved' },
  { canonicalName: 'שמנת חמוצה',  slug: 'sourcream',     variants: ['שמנת חמוצה', 'sour cream'],                                                                                  approvalStatus: 'approved' },
  { canonicalName: 'גבינת פרמזן', slug: 'parmesan',      variants: ['פרמזן', 'גבינת פרמזן', 'parmesan', 'parmesan cheese'],                                                      approvalStatus: 'approved' },
  { canonicalName: 'גבינת פטה',   slug: 'feta',          variants: ['פטה', 'גבינת פטה', 'feta', 'feta cheese'],                                                                   approvalStatus: 'approved' },
  { canonicalName: 'גבינת ריקוטה', slug: 'ricotta',      variants: ['ריקוטה', 'גבינת ריקוטה', 'ricotta', 'ricotta cheese'],                                                      approvalStatus: 'approved' },

  // Pantry
  { canonicalName: 'טחינה',        slug: 'tahini',        variants: ['טחינה', 'טחינה גולמית', 'tahini', 'raw tahini'],                                                             approvalStatus: 'approved' },
  { canonicalName: 'חומוס',        slug: 'chickpea',      variants: ['חומוס', 'גרגר חומוס', 'גרגרי חומוס', 'chickpea', 'chickpeas', 'garbanzo bean', 'garbanzo beans'],          approvalStatus: 'approved' },
  { canonicalName: 'עדשה',         slug: 'lentil',        variants: ['עדשה', 'עדשים', 'lentil', 'lentils'],                                                                        approvalStatus: 'approved' },
  { canonicalName: 'שעועית',       slug: 'bean',          variants: ['שעועית', 'שעועיות', 'bean', 'beans'],                                                                        approvalStatus: 'approved' },
  { canonicalName: 'אפונה',        slug: 'pea',           variants: ['אפונה', 'אפונים', 'pea', 'peas', 'green pea', 'green peas'],                                                approvalStatus: 'approved' },
  { canonicalName: 'תירס',         slug: 'corn',          variants: ['תירס', 'corn', 'sweet corn'],                                                                                approvalStatus: 'approved' },

  // Vegetables
  { canonicalName: 'פטרייה',       slug: 'mushroom',      variants: ['פטרייה', 'פטריות', 'mushroom', 'mushrooms'],                                                                approvalStatus: 'approved' },
  { canonicalName: 'קישוא',        slug: 'zucchini',      variants: ['קישוא', 'קישואים', 'zucchini', 'zucchinis', 'courgette', 'courgettes'],                                     approvalStatus: 'approved' },
  { canonicalName: 'חציל',         slug: 'eggplant',      variants: ['חציל', 'חצילים', 'eggplant', 'eggplants', 'aubergine', 'aubergines'],                                       approvalStatus: 'approved' },
  { canonicalName: 'אבוקדו',       slug: 'avocado',       variants: ['אבוקדו', 'אבוקדוים', 'avocado', 'avocados'],                                                                approvalStatus: 'approved' },
  { canonicalName: 'כרוב',         slug: 'cabbage',       variants: ['כרוב', 'כרובים', 'cabbage', 'cabbages'],                                                                    approvalStatus: 'approved' },
  { canonicalName: 'כרובית',       slug: 'cauliflower',   variants: ['כרובית', 'כרוביות', 'cauliflower', 'cauliflowers'],                                                         approvalStatus: 'approved' },
  { canonicalName: 'ברוקולי',      slug: 'broccoli',      variants: ['ברוקולי', 'broccoli'],                                                                                       approvalStatus: 'approved' },
  { canonicalName: 'סלרי',         slug: 'celery',        variants: ['סלרי', 'celery', 'celery stalk', 'celery stalks'],                                                           approvalStatus: 'approved' },
  { canonicalName: 'חסה',          slug: 'lettuce',       variants: ['חסה', 'חסות', 'lettuce', 'lettuces'],                                                                        approvalStatus: 'approved' },
  { canonicalName: 'תרד',          slug: 'spinach',       variants: ['תרד', 'spinach', 'baby spinach'],                                                                            approvalStatus: 'approved' },

  // Fruits
  { canonicalName: 'תפוח',         slug: 'apple',         variants: ['תפוח', 'תפוחים', 'תפוח עץ', 'תפוחי עץ', 'apple', 'apples'],                                                approvalStatus: 'approved' },
  { canonicalName: 'בננה',         slug: 'banana',        variants: ['בננה', 'בננות', 'banana', 'bananas'],                                                                        approvalStatus: 'approved' },
  { canonicalName: 'תות',          slug: 'strawberry',    variants: ['תות', 'תותים', 'strawberry', 'strawberries'],                                                               approvalStatus: 'approved' },
  { canonicalName: 'אוכמנייה',     slug: 'blueberry',     variants: ['אוכמנייה', 'אוכמניות', 'blueberry', 'blueberries'],                                                         approvalStatus: 'approved' },
  { canonicalName: 'ענב',          slug: 'grape',         variants: ['ענב', 'ענבים', 'grape', 'grapes'],                                                                           approvalStatus: 'approved' },
  { canonicalName: 'תמר',          slug: 'date',          variants: ['תמר', 'תמרים', 'date', 'dates'],                                                                             approvalStatus: 'approved' },

  // Nuts & seeds
  { canonicalName: 'אגוז',         slug: 'nut',           variants: ['אגוז', 'אגוזים', 'nut', 'nuts'],                                                                             approvalStatus: 'approved' },
  { canonicalName: 'אגוז מלך',    slug: 'walnut',        variants: ['אגוז מלך', 'אגוזי מלך', 'walnut', 'walnuts'],                                                               approvalStatus: 'approved' },
  { canonicalName: 'שקד',          slug: 'almond',        variants: ['שקד', 'שקדים', 'almond', 'almonds'],                                                                         approvalStatus: 'approved' },
  { canonicalName: 'קשיו',         slug: 'cashew',        variants: ['קשיו', 'אגוז קשיו', 'cashew', 'cashews'],                                                                    approvalStatus: 'approved' },
  { canonicalName: 'פיסטוק',       slug: 'pistachio',     variants: ['פיסטוק', 'פיסטוקים', 'pistachio', 'pistachios'],                                                            approvalStatus: 'approved' },
  { canonicalName: 'בוטן',         slug: 'peanut',        variants: ['בוטן', 'בוטנים', 'peanut', 'peanuts'],                                                                       approvalStatus: 'approved' },
  { canonicalName: 'שומשום',       slug: 'sesame',        variants: ['שומשום', 'sesame', 'sesame seeds'],                                                                          approvalStatus: 'approved' },

  // Flavorings & aromatics
  { canonicalName: 'מי ורדים',     slug: 'rosewater',          variants: ['מי ורדים', 'rose water', 'rosewater'],                                                                approvalStatus: 'approved' },
  { canonicalName: 'הל',           slug: 'cardamom',           variants: ['הל', 'cardamom', 'ground cardamom'],                                                                  approvalStatus: 'approved' },
  { canonicalName: 'אגוז מוסקט',  slug: 'nutmeg',             variants: ['אגוז מוסקט', 'nutmeg', 'ground nutmeg'],                                                              approvalStatus: 'approved' },
  { canonicalName: "ג'ינג'ר",     slug: 'ginger',             variants: ["ג'ינג'ר", 'גינגר', 'ginger', 'fresh ginger', 'ground ginger'],                                       approvalStatus: 'approved' },
  { canonicalName: "פתיתי צ'ילי", slug: 'chiliflakes',        variants: ["פתיתי צ'ילי", 'צילי גרוס', 'chili flakes', 'chilli flakes', 'red pepper flakes'],                    approvalStatus: 'approved' },
  { canonicalName: 'שמן שומשום',  slug: 'sesameoil',          variants: ['שמן שומשום', 'sesame oil', 'toasted sesame oil'],                                                     approvalStatus: 'approved' },

  // Grains & coatings
  { canonicalName: 'קמח סולת',    slug: 'semolina',           variants: ['סולת', 'קמח סולת', 'semolina', 'semolina flour'],                                                     approvalStatus: 'approved' },
  { canonicalName: 'פירורי לחם',  slug: 'breadcrumbs',        variants: ['פירורי לחם', 'breadcrumbs', 'bread crumbs'],                                                          approvalStatus: 'approved' },
  { canonicalName: 'פנקו',         slug: 'panko',              variants: ['פנקו', 'panko', 'panko breadcrumbs'],                                                                  approvalStatus: 'approved' },

  // Coconut products
  { canonicalName: 'קרם קוקוס',   slug: 'coconutcream',       variants: ['קרם קוקוס', 'cream of coconut', 'coconut cream'],                                                     approvalStatus: 'approved' },
  { canonicalName: 'חלב קוקוס',   slug: 'coconutmilk',        variants: ['חלב קוקוס', 'coconut milk'],                                                                          approvalStatus: 'approved' },
  { canonicalName: 'קוקוס',        slug: 'coconut',            variants: ['קוקוס', 'קוקוס טחון', 'coconut', 'desiccated coconut'],                                               approvalStatus: 'approved' },

  // Soft cheeses
  { canonicalName: 'גבינת שמנת',  slug: 'creamcheese',        variants: ['גבינת שמנת', 'cream cheese'],                                                                         approvalStatus: 'approved' },
  { canonicalName: 'גבינת מסקרפונה', slug: 'mascarpone',      variants: ['מסקרפונה', 'גבינת מסקרפונה', 'mascarpone'],                                                           approvalStatus: 'approved' },

  // Fresh herbs
  { canonicalName: 'רוזמרין',      slug: 'rosemary',           variants: ['רוזמרין', 'rosemary', 'rosemary leaves'],                                                             approvalStatus: 'approved' },
  { canonicalName: 'טימין',        slug: 'thyme',              variants: ['טימין', 'thyme', 'thyme leaves'],                                                                     approvalStatus: 'approved' },
  { canonicalName: 'עלי דפנה',    slug: 'bayleaf',            variants: ['עלי דפנה', 'עלה דפנה', 'bay leaf', 'bay leaves'],                                                     approvalStatus: 'approved' },

  // Vinegars & condiments
  { canonicalName: 'חומץ תפוחים', slug: 'applecidervinegar',  variants: ['חומץ תפוחים', 'apple cider vinegar', 'apple cider vinegars'],                                         approvalStatus: 'approved' },
  { canonicalName: 'חרדל',         slug: 'mustard',            variants: ['חרדל', 'mustard', 'dijon mustard'],                                                                   approvalStatus: 'approved' },

  // Sugars & syrups
  { canonicalName: 'סירופ גלוקוז', slug: 'glucosesyrup',      variants: ['סירופ גלוקוז', 'glucose syrup'],                                                                      approvalStatus: 'approved' },
  { canonicalName: 'סוכר אינוורטי', slug: 'invertsugar',      variants: ['סוכר אינוורטי', 'invert sugar'],                                                                      approvalStatus: 'approved' },
];
