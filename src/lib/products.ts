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
  { id: "bioregulators", name: "Bioregulators", count: 0 },
  { id: "blends", name: "Premium Blends", count: 0 },
];

export const products: Product[] = [
  // Weight Management
  { id: "semaglutide", name: "Semaglutide", slug: "semaglutide", category: "weight-management", strengths: ["5 mg", "10 mg", "15 mg", "20 mg", "30 mg"], description: "GLP-1 receptor agonist for metabolic research and weight management studies.", benefits: ["Metabolic regulation", "Appetite modulation", "Glycemic control"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "retatrutide", name: "Retatrutide", slug: "retatrutide", category: "weight-management", strengths: ["5 mg", "10 mg", "15 mg", "20 mg", "30 mg", "60 mg"], description: "Triple agonist peptide targeting GLP-1, GIP, and glucagon receptors.", benefits: ["Multi-receptor targeting", "Advanced metabolic research", "Next-generation weight management"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "liraglutide", name: "Liraglutide", slug: "liraglutide", category: "weight-management", strengths: ["10 mg", "20 mg"], description: "GLP-1 receptor agonist for metabolic and cardiovascular research.", benefits: ["Metabolic regulation", "Cardiovascular research", "Appetite studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "survodutide", name: "Survodutide", slug: "survodutide", category: "weight-management", strengths: ["6 mg"], description: "Dual GLP-1/glucagon receptor agonist for advanced metabolic research.", benefits: ["Dual receptor targeting", "Liver health research", "Metabolic studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "cagrilintide", name: "Cagrilintide", slug: "cagrilintide", category: "weight-management", strengths: ["5 mg", "10 mg"], description: "Long-acting amylin analogue for appetite and metabolic research.", benefits: ["Appetite modulation", "Satiety research", "Metabolic studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "aod-9604", name: "AOD-9604", slug: "aod-9604", category: "weight-management", strengths: ["5 mg", "10 mg"], description: "Modified fragment of human growth hormone for fat metabolism research.", benefits: ["Fat metabolism", "Body composition research", "No IGF-1 stimulation"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "5-amino-1mq", name: "5 Amino 1MQ", slug: "5-amino-1mq", category: "weight-management", strengths: ["10 mg"], description: "Small molecule NNMT inhibitor for energy metabolism research.", benefits: ["NNMT inhibition", "Energy metabolism", "Fat cell research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Growth Hormone
  { id: "cjc-1295-dac", name: "CJC-1295 with DAC", slug: "cjc-1295-dac", category: "growth-hormone", strengths: ["2 mg", "5 mg"], description: "Long-acting GHRH analogue with Drug Affinity Complex for sustained GH release.", benefits: ["Sustained GH release", "Extended half-life", "Growth factor research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "cjc-1295-no-dac", name: "CJC-1295 No DAC", slug: "cjc-1295-no-dac", category: "growth-hormone", strengths: ["2 mg", "5 mg", "10 mg"], description: "Modified GRF (1-29) for growth hormone releasing research.", benefits: ["GH pulse research", "Shorter acting", "Flexible dosing studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "ipamorelin", name: "Ipamorelin", slug: "ipamorelin", category: "growth-hormone", strengths: ["5 mg", "10 mg"], description: "Selective GH secretagogue with minimal side effect profile.", benefits: ["Selective GH release", "Clean profile", "Growth factor studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "ghrp-2", name: "GHRP-2", slug: "ghrp-2", category: "growth-hormone", strengths: ["5 mg", "10 mg"], description: "Growth hormone releasing peptide-2 for GH secretion research.", benefits: ["GH secretion", "Appetite stimulation research", "Growth studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "ghrp-6", name: "GHRP-6", slug: "ghrp-6", category: "growth-hormone", strengths: ["5 mg", "10 mg"], description: "Growth hormone releasing hexapeptide for ghrelin receptor research.", benefits: ["Ghrelin receptor studies", "GH release", "Appetite research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "sermorelin", name: "Sermorelin", slug: "sermorelin", category: "growth-hormone", strengths: ["5 mg", "15 mg"], description: "GHRH analogue (1-29) for natural growth hormone release studies.", benefits: ["Natural GH stimulation", "GHRH research", "Anti-aging studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "tesamorelin", name: "Tesamorelin", slug: "tesamorelin", category: "growth-hormone", strengths: ["2 mg", "5 mg", "10 mg"], description: "GHRH analogue for growth hormone release and body composition research.", benefits: ["GH release", "Visceral fat research", "Body composition"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "hgh-frag-176-191", name: "HGH Fragment 176-191", slug: "hgh-fragment-176-191", category: "growth-hormone", strengths: ["5 mg"], description: "C-terminal fragment of human growth hormone for lipolysis research.", benefits: ["Fat metabolism", "No IGF-1 effects", "Targeted research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "igf-1-lr3", name: "IGF-1 LR3", slug: "igf-1-lr3", category: "growth-hormone", strengths: ["1 mg"], description: "Long R3 Insulin-like Growth Factor-1 for cell proliferation research.", benefits: ["Extended half-life", "Cell proliferation", "Tissue growth research"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "mgf", name: "MGF", slug: "mgf", category: "growth-hormone", strengths: ["2 mg"], description: "Mechano Growth Factor for muscle repair and growth research.", benefits: ["Muscle repair research", "Satellite cell activation", "Recovery studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "peg-mgf", name: "PEG-MGF", slug: "peg-mgf", category: "growth-hormone", strengths: ["2 mg", "5 mg"], description: "PEGylated Mechano Growth Factor with extended half-life.", benefits: ["Extended duration", "Muscle research", "PEGylated stability"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "follistatin-344", name: "Follistatin 344", slug: "follistatin-344", category: "growth-hormone", strengths: ["1 mg"], description: "Activin-binding protein for myostatin inhibition research.", benefits: ["Myostatin research", "Muscle growth studies", "Reproductive research"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },

  // Healing & Recovery
  { id: "bpc-157", name: "BPC-157", slug: "bpc-157", category: "healing-recovery", strengths: ["5 mg", "10 mg", "15 mg", "20 mg"], description: "Body Protection Compound-157, a gastric pentadecapeptide for tissue repair research.", benefits: ["Tissue repair research", "Gut health studies", "Tendon/ligament research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "tb-500", name: "TB-500 (Thymosin Beta-4)", slug: "tb-500", category: "healing-recovery", strengths: ["5 mg", "10 mg"], description: "Thymosin Beta-4 for tissue regeneration and wound healing research.", benefits: ["Wound healing research", "Anti-inflammatory studies", "Tissue regeneration"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "tb-500-frag", name: "TB-500 Fragment 17-23", slug: "tb-500-fragment", category: "healing-recovery", strengths: ["10 mg"], description: "Active fragment of Thymosin Beta-4 for targeted healing research.", benefits: ["Targeted fragment", "Healing research", "Anti-inflammatory studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "ll-37", name: "LL-37 (CAP-18)", slug: "ll-37", category: "healing-recovery", strengths: ["5 mg"], description: "Human cathelicidin antimicrobial peptide for immune defense research.", benefits: ["Antimicrobial research", "Immune defense", "Wound healing studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "ara-290", name: "ARA-290", slug: "ara-290", category: "healing-recovery", strengths: ["5 mg", "10 mg", "15 mg", "50 mg"], description: "Innate Repair Receptor agonist for tissue protection and repair research.", benefits: ["Neuroprotection research", "Tissue repair", "Anti-inflammatory studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "ss-31", name: "SS-31 (Elamipretide)", slug: "ss-31", category: "healing-recovery", strengths: ["10 mg", "15 mg", "25 mg", "30 mg", "50 mg"], description: "Mitochondria-targeted peptide for cellular energy and protection research.", benefits: ["Mitochondrial research", "Cellular energy", "Cardioprotection studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "kpv", name: "KPV", slug: "kpv", category: "healing-recovery", strengths: ["5 mg", "10 mg"], description: "Alpha-MSH derivative tripeptide for anti-inflammatory research.", benefits: ["Anti-inflammatory research", "Gut health studies", "Immune modulation"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "vip", name: "VIP (Vasoactive Intestinal Peptide)", slug: "vip", category: "healing-recovery", strengths: ["5 mg"], description: "Neuropeptide for immune regulation and respiratory research.", benefits: ["Immune regulation", "Respiratory research", "Neuroprotection"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },

  // Anti-Aging & Longevity
  { id: "epitalon", name: "Epitalon (Epithalon)", slug: "epitalon", category: "anti-aging", strengths: ["10 mg", "20 mg", "30 mg", "35 mg", "50 mg"], description: "Synthetic tetrapeptide for telomerase activation and longevity research.", benefits: ["Telomerase research", "Longevity studies", "Pineal gland research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "ghk-cu", name: "GHK-Cu", slug: "ghk-cu", category: "anti-aging", strengths: ["50 mg", "100 mg"], description: "Copper peptide complex for skin regeneration and anti-aging research.", benefits: ["Skin regeneration", "Collagen synthesis", "Anti-aging research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "fox04-dri", name: "FOX04-DRI", slug: "fox04-dri", category: "anti-aging", strengths: ["10 mg"], description: "D-retro-inverso peptide for senescent cell research.", benefits: ["Senolytic research", "Cellular aging studies", "Longevity research"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "mots-c", name: "MOTS-C", slug: "mots-c", category: "anti-aging", strengths: ["10 mg"], description: "Mitochondrial-derived peptide for metabolic and aging research.", benefits: ["Metabolic research", "Exercise mimetic studies", "Aging research"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "snap-8", name: "Snap-8", slug: "snap-8", category: "anti-aging", strengths: ["10 mg"], description: "Octapeptide for expression line and skin aging research.", benefits: ["Anti-wrinkle research", "SNARE complex studies", "Cosmeceutical research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "dsip", name: "DSIP", slug: "dsip", category: "anti-aging", strengths: ["5 mg"], description: "Delta Sleep Inducing Peptide for sleep regulation research.", benefits: ["Sleep research", "Stress response studies", "Circadian rhythm research"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },

  // Cognitive & Neuroprotection
  { id: "selank", name: "Selank", slug: "selank", category: "cognitive", strengths: ["5 mg", "10 mg", "20 mg"], description: "Synthetic analogue of tuftsin for anxiolytic and cognitive research.", benefits: ["Anxiolytic research", "Cognitive enhancement", "Immune modulation studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "semax", name: "Semax", slug: "semax", category: "cognitive", strengths: ["5 mg", "10 mg", "20 mg", "30 mg"], description: "Synthetic ACTH analogue for neuroprotection and cognitive research.", benefits: ["Neuroprotection", "Cognitive research", "BDNF modulation studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "n-acetyl-semax", name: "N-Acetyl Semax", slug: "n-acetyl-semax", category: "cognitive", strengths: ["30 mg"], description: "Acetylated form of Semax with enhanced bioavailability.", benefits: ["Enhanced stability", "Neuroprotection", "Cognitive research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "pe-22-28", name: "PE-22-28", slug: "pe-22-28", category: "cognitive", strengths: ["10 mg"], description: "Spadin analogue peptide for TREK-1 channel research.", benefits: ["Antidepressant research", "TREK-1 studies", "Neuroplasticity research"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },

  // Immune Support
  { id: "thymosin-alpha-1", name: "Thymosin Alpha 1", slug: "thymosin-alpha-1", category: "immune", strengths: ["5 mg", "10 mg"], description: "Thymic peptide for immune system modulation research.", benefits: ["Immune modulation", "T-cell research", "Antiviral studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "thymalin", name: "Thymalin (Thymulin)", slug: "thymalin", category: "immune", strengths: ["10 mg"], description: "Thymic bioregulator peptide for immune function research.", benefits: ["Thymus research", "Immune regulation", "Bioregulator studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Sexual Health
  { id: "pt-141", name: "PT-141 (Bremelanotide)", slug: "pt-141", category: "sexual-health", strengths: ["10 mg"], description: "Melanocortin receptor agonist for sexual function research.", benefits: ["MC receptor research", "Sexual function studies", "CNS activation research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "melanotan-2", name: "Melanotan 2", slug: "melanotan-2", category: "sexual-health", strengths: ["10 mg"], description: "Synthetic melanocortin peptide for pigmentation and sexual function research.", benefits: ["Melanocortin research", "Pigmentation studies", "Sexual function research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "kisspeptin-10", name: "Kisspeptin-10", slug: "kisspeptin-10", category: "sexual-health", strengths: ["5 mg", "10 mg"], description: "GnRH-stimulating peptide for reproductive endocrinology research.", benefits: ["Reproductive research", "GnRH stimulation", "Fertility studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "-20°C" },
  { id: "oxytocin", name: "Oxytocin", slug: "oxytocin", category: "sexual-health", strengths: ["2 mg", "5 mg", "10 mg"], description: "Neuropeptide for social behavior and reproductive research.", benefits: ["Social behavior research", "Reproductive studies", "Bonding research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Bioregulators
  { id: "bronchogen", name: "Bronchogen", slug: "bronchogen", category: "bioregulators", strengths: ["20 mg"], description: "Bioregulator peptide for respiratory tissue research.", benefits: ["Respiratory research", "Tissue bioregulation", "Lung health studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "cardiogen", name: "Cardiogen", slug: "cardiogen", category: "bioregulators", strengths: ["20 mg"], description: "Cardiac bioregulator peptide for cardiovascular research.", benefits: ["Cardiovascular research", "Heart tissue studies", "Cardioprotection"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "cartalax", name: "Cartalax", slug: "cartalax", category: "bioregulators", strengths: ["20 mg"], description: "Cartilage bioregulator peptide for musculoskeletal research.", benefits: ["Cartilage research", "Joint health studies", "Musculoskeletal research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "chonluten", name: "Chonluten", slug: "chonluten", category: "bioregulators", strengths: ["20 mg"], description: "Respiratory mucosa bioregulator for lung tissue research.", benefits: ["Mucosal research", "Respiratory studies", "Tissue regeneration"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "cortagen", name: "Cortagen", slug: "cortagen", category: "bioregulators", strengths: ["20 mg"], description: "Brain cortex bioregulator for cognitive and neural research.", benefits: ["Brain research", "Cognitive studies", "Neural bioregulation"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "pinealon", name: "Pinealon", slug: "pinealon", category: "bioregulators", strengths: ["10 mg", "20 mg"], description: "Pineal gland bioregulator for circadian rhythm and neuro research.", benefits: ["Circadian research", "Neuroprotection", "Pineal gland studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "testagen", name: "Testagen", slug: "testagen", category: "bioregulators", strengths: ["20 mg"], description: "Testicular bioregulator for male reproductive research.", benefits: ["Reproductive research", "Hormonal studies", "Testicular bioregulation"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "thymogen", name: "Thymogen", slug: "thymogen", category: "bioregulators", strengths: ["20 mg"], description: "Thymus bioregulator for immune system research.", benefits: ["Immune research", "Thymus bioregulation", "Immunomodulation"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "vesugen", name: "Vesugen", slug: "vesugen", category: "bioregulators", strengths: ["20 mg"], description: "Vascular bioregulator for circulatory system research.", benefits: ["Vascular research", "Circulatory studies", "Endothelial research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },

  // Premium Blends
  { id: "bpc-tb-blend", name: "BPC-157 & TB-500 Blend", slug: "bpc-157-tb-500-blend", category: "blends", strengths: ["10 mg (5mg/5mg)", "20 mg (10mg/10mg)"], description: "Synergistic healing peptide blend combining BPC-157 and TB-500.", benefits: ["Enhanced healing research", "Synergistic effects", "Comprehensive recovery studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "bpc-tb-mgf-blend", name: "BPC-157 & TB-500 & MGF Blend", slug: "bpc-tb-mgf-blend", category: "blends", strengths: ["10/7.5/1 mg"], description: "Triple peptide blend for comprehensive tissue repair research.", benefits: ["Multi-pathway healing", "Muscle recovery research", "Advanced repair studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "cagrisema", name: "CagriSema", slug: "cagrisema", category: "blends", strengths: ["10 mg (5/5mg)", "20 mg (10/10mg)"], description: "Cagrilintide + Semaglutide combination for metabolic research.", benefits: ["Dual mechanism", "Advanced metabolic research", "Weight management studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "cjc-ipa-blend", name: "CJC-1295 No DAC & Ipamorelin Blend", slug: "cjc-ipamorelin-blend", category: "blends", strengths: ["10 mg (5mg/5mg)"], description: "Growth hormone peptide combination for synergistic GH release research.", benefits: ["Synergistic GH release", "Dual pathway research", "Enhanced growth studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "glow", name: "Glow Blend", slug: "glow-blend", category: "blends", strengths: ["GHK-Cu 50mg + TB-500 10mg + BPC-157 10mg", "GHK-Cu 70mg + TB-500 10mg + BPC-157 10mg"], description: "Premium skin rejuvenation blend for aesthetic and regenerative research.", benefits: ["Skin regeneration research", "Collagen studies", "Comprehensive anti-aging"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "super-glow", name: "Super Glow Blend", slug: "super-glow-blend", category: "blends", strengths: ["GHK-Cu 50mg + TB-500 10mg + BPC-157 10mg + KPV 10mg"], description: "Enhanced skin blend with anti-inflammatory KPV addition.", benefits: ["Enhanced skin research", "Anti-inflammatory", "Premium regenerative studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "selank-semax-blend", name: "Selank & Semax Blend", slug: "selank-semax-blend", category: "blends", strengths: ["10 mg (5/5mg)"], description: "Cognitive nootropic blend for enhanced neurological research.", benefits: ["Dual cognitive research", "Neuroprotection", "Enhanced nootropic studies"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
  { id: "tesa-ipa-blend", name: "Tesamorelin & Ipamorelin Blend", slug: "tesamorelin-ipamorelin-blend", category: "blends", strengths: ["6/2 mg", "10/5 mg"], description: "Growth hormone peptide combination for optimized GH research.", benefits: ["Optimized GH release", "Dual mechanism", "Body composition research"], purity: "≥98%", form: "Lyophilized Powder", storage: "2-8°C" },
];

// Calculate category counts
productCategories.forEach(cat => {
  if (cat.id === "all") {
    cat.count = products.length;
  } else {
    cat.count = products.filter(p => p.category === cat.id).length;
  }
});
