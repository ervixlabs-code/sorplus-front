import type { Complaint } from "@/components/ComplaintCard"

export const categories = [
  { slug: "kargo-teslimat", name: "Kargo & Teslimat" },
  { slug: "e-ticaret", name: "E-Ticaret" },
  { slug: "abonelik-fatura", name: "Abonelik & Fatura" },
  { slug: "bankacilik", name: "Bankacılık" },
  { slug: "restoran-servis", name: "Restoran & Servis" },
]

export const complaints: Complaint[] = [
  {
    id: "101",
    title: "Teslimat gecikti, kimse bilgi vermiyor",
    body: "Siparişim 7 gündür dağıtımda görünüyor. Müşteri hizmetleri hep aynı cevabı veriyor. Trendyol üzerinden aldığım üründe süreç çok uzadı.",
    category: { slug: "kargo-teslimat", name: "Kargo & Teslimat" },
    createdAt: "Bugün",
    supportCount: 128,
  },
  {
    id: "102",
    title: "Abonelik iptali yapamıyorum",
    body: "Uygulama içinden iptal deniyorum ama hata veriyor. Ücret kesimi devam ediyor, iade süreci de belirsiz.",
    category: { slug: "abonelik-fatura", name: "Abonelik & Fatura" },
    createdAt: "Dün",
    supportCount: 64,
  },
  {
    id: "103",
    title: "İade talebim reddedildi",
    body: "Ürün kusurlu geldi. Fotoğraflarla kanıtlamama rağmen reddettiler. Süreci şeffaf yürütmüyorlar.",
    category: { slug: "e-ticaret", name: "E-Ticaret" },
    createdAt: "2 gün önce",
    supportCount: 42,
  },
]
