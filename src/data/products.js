/**
 * 产品数据库
 * 包含产品详细信息、价格、功效等
 */

export const PRODUCT_DATABASE = {
  '舒肝解郁茶包': {
    id: 'tea_001',
    name: '舒肝解郁茶包',
    category: '中药茶包',
    price: 158,
    originalPrice: 198,
    description: '疏肝解郁，宁心安神',
    detailDescription: '精选柴胡、白芍、当归等优质中药材，专为肝郁体质调配。有助于疏肝理气、解郁安神，改善情志不舒、失眠多梦等症状。',
    images: ['/images/products/shugan_tea.jpg'],
    specifications: '3g×30包/盒',
    usage: '每日2-3次，每次1包，开水冲泡5-10分钟后饮用',
    ingredients: ['柴胡', '白芍', '当归', '郁金', '甘草'],
    effects: ['疏肝理气', '解郁安神', '调理情志'],
    suitableFor: ['肝郁肾虚', '肝郁脑虚'],
    contraindications: '孕妇慎用',
    stock: 100,
    sales: 256,
    rating: 4.8
  },
  
  '补血活血茶包': {
    id: 'tea_002',
    name: '补血活血茶包',
    category: '中药茶包',
    price: 168,
    originalPrice: 218,
    description: '补气养血，调和营卫',
    detailDescription: '采用当归、川芎、红花等名贵药材精制而成。专门针对气血两虚体质，能够补血活血、调和营卫，改善面色萎黄、失眠健忘等问题。',
    images: ['/images/products/buxue_tea.jpg'],
    specifications: '3g×30包/盒',
    usage: '每日2次，每次1包，餐后温水冲泡饮用',
    ingredients: ['当归', '川芎', '红花', '丹参', '黄芪'],
    effects: ['补血养血', '活血化瘀', '调和营卫'],
    suitableFor: ['气血两虚', '气滞血瘀'],
    contraindications: '经期妇女慎用',
    stock: 88,
    sales: 189,
    rating: 4.7
  },
  
  '安神定志茶包': {
    id: 'tea_003',
    name: '安神定志茶包',
    category: '中药茶包',
    price: 148,
    originalPrice: 188,
    description: '安神定志，宁心除烦',
    detailDescription: '精选酸枣仁、远志、龙骨等传统安神药材。专为精神衰弱、心神不宁者调配，具有养心安神、定志除烦的功效。',
    images: ['/images/products/anshen_tea.jpg'],
    specifications: '3g×30包/盒',
    usage: '每日2次，睡前1小时和下午各1包',
    ingredients: ['酸枣仁', '远志', '龙骨', '茯神', '五味子'],
    effects: ['养心安神', '定志除烦', '改善睡眠'],
    suitableFor: ['精髓空虚', '神经衰弱'],
    contraindications: '感冒期间停用',
    stock: 75,
    sales: 167,
    rating: 4.9
  },
  
  '通用安眠茶包': {
    id: 'tea_004',
    name: '通用安眠茶包',
    category: '中药茶包',
    price: 128,
    originalPrice: 168,
    description: '温和安神，改善睡眠质量',
    detailDescription: '温和配方，适合各种体质。采用薰衣草、洋甘菊等天然植物，温和助眠，无依赖性，帮助自然入睡。',
    images: ['/images/products/general_tea.jpg'],
    specifications: '2g×40包/盒',
    usage: '睡前30分钟冲泡1包饮用',
    ingredients: ['薰衣草', '洋甘菊', '柠檬香蜂草', '西番莲'],
    effects: ['温和助眠', '放松神经', '改善睡眠'],
    suitableFor: ['睡眠质量优秀', '通用型'],
    contraindications: '无特殊禁忌',
    stock: 120,
    sales: 345,
    rating: 4.6
  },
  
  '植物蛋白奶粉': {
    id: 'nutrition_001',
    name: '植物蛋白奶粉',
    category: '营养补充',
    price: 298,
    originalPrice: 358,
    description: '优质植物蛋白，补充营养',
    detailDescription: '采用多种植物蛋白，富含必需氨基酸。专为身体虚弱、营养不良者设计，有助于提高免疫力，改善体质。',
    images: ['/images/products/protein_powder.jpg'],
    specifications: '500g/罐，约25次用量',
    usage: '每日1-2次，每次20g用温水冲调',
    ingredients: ['大豆蛋白', '碗豆蛋白', '糙米蛋白', '维生素B群'],
    effects: ['补充蛋白质', '提高免疫力', '改善营养状况'],
    suitableFor: ['气血两虚', '精髓空虚'],
    contraindications: '大豆过敏者慎用',
    stock: 60,
    sales: 123,
    rating: 4.5
  },
  
  '坚果营养包': {
    id: 'nutrition_002',
    name: '坚果营养包',
    category: '营养补充',
    price: 188,
    originalPrice: 238,
    description: '补肾填精，强筋健骨',
    detailDescription: '精选核桃、黑芝麻、枸杞等天然食材。富含不饱和脂肪酸、维生素E等营养素，有助于补肾填精、强筋健骨。',
    images: ['/images/products/nuts_pack.jpg'],
    specifications: '25g×20包/盒',
    usage: '每日1-2包，可直接食用或加入牛奶',
    ingredients: ['核桃仁', '黑芝麻', '枸杞', '红枣', '桂圆'],
    effects: ['补肾填精', '强筋健骨', '滋养肝肾'],
    suitableFor: ['肝郁肾虚', '精髓空虚'],
    contraindications: '坚果过敏者禁用',
    stock: 95,
    sales: 278,
    rating: 4.7
  },
  
  '鱼油胶囊': {
    id: 'supplement_001',
    name: '鱼油胶囊',
    category: '保健品',
    price: 228,
    originalPrice: 288,
    description: '补脑益智，增强记忆',
    detailDescription: '深海鱼油提取，富含DHA和EPA。专门针对用脑过度、记忆力下降者，有助于改善脑部营养，增强记忆力。',
    images: ['/images/products/fish_oil.jpg'],
    specifications: '1000mg×60粒/瓶',
    usage: '每日2次，每次1粒，餐后服用',
    ingredients: ['深海鱼油', 'DHA', 'EPA', '维生素E'],
    effects: ['补脑益智', '增强记忆', '改善认知'],
    suitableFor: ['肝郁脑虚', '神经衰弱'],
    contraindications: '鱼类过敏者禁用',
    stock: 85,
    sales: 145,
    rating: 4.6
  },
  
  '穴位贴': {
    id: 'external_001',
    name: '穴位贴',
    category: '外用贴剂',
    price: 118,
    originalPrice: 148,
    description: '外治内调，疗效显著',
    detailDescription: '根据中医穴位理论研制，含有多种中药提取物。贴敷于相关穴位，通过皮肤吸收，外治内调，安全有效。',
    images: ['/images/products/acupoint_patch.jpg'],
    specifications: '4贴×10板/盒',
    usage: '贴敷于神门、印堂等安神穴位，每日更换',
    ingredients: ['当归提取物', '川芎提取物', '薰衣草精油'],
    effects: ['外治内调', '安神助眠', '调理气血'],
    suitableFor: ['肝郁肾虚', '肝郁脑虚', '气滞血瘀'],
    contraindications: '皮肤破损处勿用',
    stock: 150,
    sales: 389,
    rating: 4.8
  }
}

// 根据证型获取推荐产品
export const getRecommendedProducts = (diagnosis) => {
  const PRODUCT_RULES = {
    '肝郁肾虚': ['舒肝解郁茶包', '坚果营养包', '穴位贴'],
    '肝郁脑虚': ['舒肝解郁茶包', '鱼油胶囊', '穴位贴'],
    '气血两虚': ['补血活血茶包', '植物蛋白奶粉', '坚果营养包'],
    '气滞血瘀': ['补血活血茶包', '鱼油胶囊', '穴位贴'],
    '精髓空虚': ['安神定志茶包', '坚果营养包', '植物蛋白奶粉'],
    '神经衰弱': ['安神定志茶包', '鱼油胶囊', '穴位贴'],
    '睡眠质量优秀': ['通用安眠茶包'],
    '通用型': ['通用安眠茶包', '植物蛋白奶粉', '穴位贴']
  }
  
  const productNames = PRODUCT_RULES[diagnosis] || PRODUCT_RULES['通用型']
  return productNames.map(name => PRODUCT_DATABASE[name]).filter(Boolean)
}

// 获取产品组合优惠价
export const getComboPrice = (products) => {
  if (products.length <= 1) return null
  
  const totalPrice = products.reduce((sum, product) => sum + product.price, 0)
  const discount = products.length >= 3 ? 0.8 : 0.9  // 3个产品8折，2个产品9折
  const comboPrice = Math.round(totalPrice * discount)
  
  return {
    totalPrice,
    comboPrice,
    discount: Math.round((1 - discount) * 100),
    savings: totalPrice - comboPrice
  }
}

export default {
  PRODUCT_DATABASE,
  getRecommendedProducts,
  getComboPrice
}