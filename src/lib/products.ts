export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  strengths: string[];
  description: string;
  benefits: string[];
  casNumber?: string;
  molecularWeight?: string;
  purity?: string;
  form?: string;
  storage?: string;
}

export const productCategories = [
  { id: "all", name: "All Peptides", count: 0 },
  { id: "weight-management", name: "Weight Management", count: 0 },
  { id: "growth-hormone", name: "Growth Hormone", count: 0 },
  { id: "healing-recovery", name: "Healing & Recovery", count: 0 },
  { id: "anti-aging", name: "Anti-Aging & Longevity", count: 0 },
  { id: "cognitive", name: "Cognitive & Neuroprotection", count: 0 },
  { id: "immune", name: "Immune Support", count: 0 },
  { id: "sexual-health", name: "Sexual Health", count: 0 },
  { id: "skin-hair", name: "Skin & Hair", count: 0 },
  { id: "blends", name: "Premium Blends", count: 0 },
  { id: "accessories", name: "Accessories", count: 0 },
];

export const products: Product[] = [
  // Weight Management
  { id: "semaglutide", name: "Semaglutide", slug: "semaglutide", category: "weight-management", strengths: ["10 mg"], description: "GLP-1 receptor agonist for metabolic research and weight management studies.", benefits: ["Metabolic regulation", "Appetite modulation", "Glycemic control"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "retatrutide", name: "Retatrutide", slug: "retatrutide", category: "weight-management", strengths: ["10 mg", "20 mg", "30 mg"], description: "Triple agonist peptide targeting GLP-1, GIP, and glucagon receptors.", benefits: ["Multi-receptor targeting", "Advanced metabolic research", "Next-generation weight management"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "survodutide", name: "Survodutide", slug: "survodutide", category: "weight-management", strengths: ["10 mg", "20 mg", "30 mg"], description: "Dual GLP-1/glucagon receptor agonist for advanced metabolic research.", benefits: ["Dual receptor targeting", "Liver health research", "Metabolic studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "aod-9604", name: "AOD-9604", slug: "aod-9604", category: "weight-management", strengths: ["5 mg"], description: "Modified fragment of human growth hormone for fat metabolism research.", benefits: ["Fat metabolism", "Body composition research", "No IGF-1 stimulation"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "5-amino-1mq", name: "5 Amino 1MQ", slug: "5-amino-1mq", category: "weight-management", strengths: ["10 mg", "50 mg"], description: "Small molecule NNMT inhibitor for energy metabolism research.", benefits: ["NNMT inhibition", "Energy metabolism", "Fat cell research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Growth Hormone
  { id: "ipamorelin", name: "Ipamorelin", slug: "ipamorelin", category: "growth-hormone", strengths: ["10 mg"], description: "Selective GH secretagogue with minimal side effect profile.", benefits: ["Selective GH release", "Clean profile", "Growth factor studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "ghrp-6", name: "GHRP-6", slug: "ghrp-6", category: "growth-hormone", strengths: ["5 mg"], description: "Growth hormone releasing hexapeptide for ghrelin receptor research.", benefits: ["Ghrelin receptor studies", "GH release", "Appetite research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "sermorelin", name: "Sermorelin", slug: "sermorelin", category: "growth-hormone", strengths: ["10 mg"], description: "GHRH analogue (1-29) for natural growth hormone release studies.", benefits: ["Natural GH stimulation", "GHRH research", "Anti-aging studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "tesamorelin", name: "Tesamorelin", slug: "tesamorelin", category: "growth-hormone", strengths: ["10 mg", "20 mg"], description: "GHRH analogue for growth hormone release and body composition research.", benefits: ["GH release", "Visceral fat research", "Body composition"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "igf-1-lr3", name: "IGF-1 LR3", slug: "igf-1-lr3", category: "growth-hormone", strengths: ["1 mg"], description: "Long R3 Insulin-like Growth Factor-1 for cell proliferation research.", benefits: ["Extended half-life", "Cell proliferation", "Tissue growth research"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "hcg", name: "HCG", slug: "hcg", category: "growth-hormone", strengths: ["10000 IU"], description: "Human Chorionic Gonadotropin for endocrine and reproductive research.", benefits: ["LH receptor research", "Reproductive endocrinology", "Hormonal studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Healing & Recovery
  { id: "bpc-157", name: "BPC-157", slug: "bpc-157", category: "healing-recovery", strengths: ["5 mg", "10 mg", "20 mg"], description: "Body Protection Compound-157, a gastric pentadecapeptide for tissue repair research.", benefits: ["Tissue repair research", "Gut health studies", "Tendon/ligament research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "tb-500", name: "TB-500 (Thymosin Beta-4)", slug: "tb-500", category: "healing-recovery", strengths: ["5 mg", "10 mg"], description: "Thymosin Beta-4 for tissue regeneration and wound healing research.", benefits: ["Wound healing research", "Anti-inflammatory studies", "Tissue regeneration"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "ll-37", name: "LL-37 (CAP-18)", slug: "ll-37", category: "healing-recovery", strengths: ["5 mg"], description: "Human cathelicidin antimicrobial peptide for immune defense research.", benefits: ["Antimicrobial research", "Immune defense", "Wound healing studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "ss-31", name: "SS-31 (Elamipretide)", slug: "ss-31", category: "healing-recovery", strengths: ["10 mg", "30 mg", "50 mg"], description: "Mitochondria-targeted peptide for cellular energy and protection research.", benefits: ["Mitochondrial research", "Cellular energy", "Cardioprotection studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "kpv", name: "KPV", slug: "kpv", category: "healing-recovery", strengths: ["10 mg", "30 mg"], description: "Alpha-MSH derivative tripeptide for anti-inflammatory research.", benefits: ["Anti-inflammatory research", "Gut health studies", "Immune modulation"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "vip", name: "VIP (Vasoactive Intestinal Peptide)", slug: "vip", category: "healing-recovery", strengths: ["10 mg"], description: "Neuropeptide for immune regulation and respiratory research.", benefits: ["Immune regulation", "Respiratory research", "Neuroprotection"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },

  // Anti-Aging & Longevity
  { id: "epitalon", name: "Epitalon (Epithalon)", slug: "epitalon", category: "anti-aging", strengths: ["10 mg", "50 mg"], description: "Synthetic tetrapeptide for telomerase activation and longevity research.", benefits: ["Telomerase research", "Longevity studies", "Pineal gland research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "mots-c", name: "MOTS-C", slug: "mots-c", category: "anti-aging", strengths: ["10 mg", "20 mg", "40 mg"], description: "Mitochondrial-derived peptide for metabolic and aging research.", benefits: ["Metabolic research", "Exercise mimetic studies", "Aging research"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "dsip", name: "DSIP", slug: "dsip", category: "anti-aging", strengths: ["5 mg", "15 mg"], description: "Delta Sleep Inducing Peptide for sleep regulation research.", benefits: ["Sleep research", "Stress response studies", "Circadian rhythm research"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "glutathione", name: "Glutathione", slug: "glutathione", category: "anti-aging", strengths: ["1500 mg"], description: "Master antioxidant tripeptide for cellular detoxification and longevity research.", benefits: ["Antioxidant research", "Detoxification studies", "Cellular repair"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "nad-plus", name: "NAD+", slug: "nad-plus", category: "anti-aging", strengths: ["500 mg", "1000 mg"], description: "Nicotinamide Adenine Dinucleotide for mitochondrial and longevity research.", benefits: ["Mitochondrial energy", "Sirtuin research", "Aging studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Cognitive & Neuroprotection
  { id: "n-acetyl-semax", name: "N-Acetyl Semax", slug: "n-acetyl-semax", category: "cognitive", strengths: ["10 mg"], description: "Acetylated form of Semax with enhanced bioavailability.", benefits: ["Enhanced stability", "Neuroprotection", "Cognitive research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "n-acetyl-selank", name: "N-Acetyl Selank", slug: "n-acetyl-selank", category: "cognitive", strengths: ["10 mg"], description: "Acetylated form of Selank with enhanced bioavailability and stability.", benefits: ["Enhanced stability", "Anxiolytic research", "Cognitive enhancement"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "pinealon", name: "Pinealon", slug: "pinealon", category: "cognitive", strengths: ["20 mg"], description: "Pineal gland bioregulator for circadian rhythm and neuro research.", benefits: ["Circadian research", "Neuroprotection", "Pineal gland studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Immune Support
  { id: "thymosin-alpha-1", name: "Thymosin Alpha 1", slug: "thymosin-alpha-1", category: "immune", strengths: ["5 mg", "10 mg"], description: "Thymic peptide for immune system modulation research.", benefits: ["Immune modulation", "T-cell research", "Antiviral studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Sexual Health
  { id: "pt-141", name: "PT-141 (Bremelanotide)", slug: "pt-141", category: "sexual-health", strengths: ["10 mg"], description: "Melanocortin receptor agonist for sexual function research.", benefits: ["MC receptor research", "Sexual function studies", "CNS activation research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "kisspeptin-10", name: "Kisspeptin-10", slug: "kisspeptin-10", category: "sexual-health", strengths: ["5 mg", "10 mg"], description: "GnRH-stimulating peptide for reproductive endocrinology research.", benefits: ["Reproductive research", "GnRH stimulation", "Fertility studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },

  // Skin & Hair
  { id: "ghk-cu", name: "GHK-Cu", slug: "ghk-cu", category: "skin-hair", strengths: ["50 mg", "100 mg"], description: "Copper peptide complex for skin regeneration and anti-aging research.", benefits: ["Skin regeneration", "Collagen synthesis", "Anti-aging research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "melanotan-1", name: "Melanotan 1", slug: "melanotan-1", category: "skin-hair", strengths: ["10 mg"], description: "Synthetic melanocortin peptide for pigmentation research.", benefits: ["Melanocortin research", "Pigmentation studies", "Skin tone research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "melanotan-2", name: "Melanotan 2", slug: "melanotan-2", category: "skin-hair", strengths: ["10 mg"], description: "Synthetic melanocortin peptide for pigmentation and sexual function research.", benefits: ["Melanocortin research", "Pigmentation studies", "Sexual function research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Premium Blends
  { id: "bpc-tb-blend", name: "BPC-157 & TB-500 Blend", slug: "bpc-157-tb-500-blend", category: "blends", strengths: ["20 mg (10mg/10mg)", "60 mg (30mg/30mg)"], description: "Synergistic healing peptide blend combining BPC-157 and TB-500.", benefits: ["Enhanced healing research", "Synergistic effects", "Comprehensive recovery studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "cjc-ipa-blend", name: "CJC-1295 No DAC & Ipamorelin Blend", slug: "cjc-ipamorelin-blend", category: "blends", strengths: ["10 mg (5mg/5mg)", "20 mg (10mg/10mg)"], description: "Growth hormone peptide combination for synergistic GH release research.", benefits: ["Synergistic GH release", "Dual pathway research", "Enhanced growth studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "tesa-ipa-blend", name: "Tesamorelin & Ipamorelin Blend", slug: "tesamorelin-ipamorelin-blend", category: "blends", strengths: ["10/3 mg"], description: "Growth hormone peptide combination for optimized GH research.", benefits: ["Optimized GH release", "Dual mechanism", "Body composition research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "glow", name: "Glow Blend", slug: "glow-blend", category: "blends", strengths: ["GHK-Cu 50mg + TB-500 10mg + BPC-157 10mg"], description: "Premium skin rejuvenation blend for aesthetic and regenerative research.", benefits: ["Skin regeneration research", "Collagen studies", "Comprehensive anti-aging"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "super-glow", name: "Super Glow Blend (KLOW)", slug: "super-glow-blend", category: "blends", strengths: ["GHK-Cu 50mg + TB-500 10mg + BPC-157 10mg + KPV 10mg"], description: "Enhanced skin blend with anti-inflammatory KPV addition.", benefits: ["Enhanced skin research", "Anti-inflammatory", "Premium regenerative studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Accessories
  { id: "bacteriostatic-water", name: "Bacteriostatic Water", slug: "bacteriostatic-water", category: "accessories", strengths: ["10 mL", "30 mL"], description: "Sterile water with 0.9% benzyl alcohol for peptide reconstitution.", benefits: ["Peptide reconstitution", "Multi-dose use", "Preservative-stabilized"], purity: "USP grade", form: "Sterile Solution", storage: "Room temperature" },
];

// Calculate category counts
productCategories.forEach(cat => {
  if (cat.id === "all") {
    cat.count = products.length;
  } else {
    cat.count = products.filter(p => p.category === cat.id).length;
  }
});
