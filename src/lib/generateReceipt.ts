import jsPDF from "jspdf";

interface ReceiptData {
  restaurantName: string;
  restaurantPhone?: string;
  restaurantAddress?: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  deliveryAddress?: string;
  items: { dish_name: string; quantity: number; unit_price: number; total_price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

function formatPrice(value: number): string {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function generateReceipt(data: ReceiptData) {
  const doc = new jsPDF({ unit: "mm", format: [80, 200] }); // receipt width 80mm
  const w = 80;
  let y = 10;

  const center = (text: string, size: number) => {
    doc.setFontSize(size);
    const tw = doc.getTextWidth(text);
    doc.text(text, (w - tw) / 2, y);
    y += size * 0.5 + 1;
  };

  const line = () => {
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(5, y, w - 5, y);
    y += 3;
  };

  // Header
  doc.setFont("helvetica", "bold");
  center(data.restaurantName.toUpperCase(), 12);
  y += 1;

  doc.setFont("helvetica", "normal");
  if (data.restaurantAddress) center(data.restaurantAddress, 7);
  if (data.restaurantPhone) center(`Tél: ${data.restaurantPhone}`, 7);
  y += 2;
  line();

  // Order info
  doc.setFontSize(7);
  doc.text(`Commande: #${data.orderId.slice(0, 8).toUpperCase()}`, 5, y); y += 4;
  doc.text(`Date: ${new Date(data.createdAt).toLocaleString("fr-FR")}`, 5, y); y += 4;
  doc.text(`Client: ${data.customerName}`, 5, y); y += 4;
  doc.text(`Tél: ${data.customerPhone}`, 5, y); y += 4;
  doc.text(`Type: ${data.orderType === "delivery" ? "Livraison" : "À emporter"}`, 5, y); y += 4;
  if (data.deliveryAddress) {
    doc.text(`Adresse: ${data.deliveryAddress}`, 5, y); y += 4;
  }
  y += 1;
  line();

  // Items header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Article", 5, y);
  doc.text("Qté", 45, y);
  doc.text("Total", w - 5, y, { align: "right" });
  y += 4;
  doc.setFont("helvetica", "normal");

  // Items
  data.items.forEach(item => {
    const name = item.dish_name.length > 22 ? item.dish_name.slice(0, 22) + "…" : item.dish_name;
    doc.text(name, 5, y);
    doc.text(String(item.quantity), 48, y);
    doc.text(`${formatPrice(item.total_price)} F`, w - 5, y, { align: "right" });
    y += 4;
  });

  y += 1;
  line();

  // Totals
  doc.setFontSize(7);
  doc.text("Sous-total:", 5, y);
  doc.text(`${formatPrice(data.subtotal)} FCFA`, w - 5, y, { align: "right" });
  y += 4;

  if (data.deliveryFee > 0) {
    doc.text("Livraison:", 5, y);
    doc.text(`${formatPrice(data.deliveryFee)} FCFA`, w - 5, y, { align: "right" });
    y += 4;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL:", 5, y);
  doc.text(`${formatPrice(data.total)} FCFA`, w - 5, y, { align: "right" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Paiement: ${data.paymentMethod === "cash" ? "Espèces" : data.paymentMethod === "wave" ? "Wave" : data.paymentMethod === "om" ? "Orange Money" : data.paymentMethod}`, 5, y);
  y += 5;

  line();
  center("Merci pour votre commande !", 8);
  center("Powered by MenuUp", 6);

  // Save
  doc.save(`recu-${data.orderId.slice(0, 8)}.pdf`);
}

interface ReservationReceiptData {
  restaurantName: string;
  restaurantPhone?: string;
  restaurantAddress?: string;
  reservationId: string;
  customerName: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  status: string;
  notes?: string;
  createdAt: string;
}

export function generateReservationReceipt(data: ReservationReceiptData) {
  const doc = new jsPDF({ unit: "mm", format: [80, 160] });
  const w = 80;
  let y = 10;

  const center = (text: string, size: number) => {
    doc.setFontSize(size);
    const tw = doc.getTextWidth(text);
    doc.text(text, (w - tw) / 2, y);
    y += size * 0.5 + 1;
  };

  const line = () => {
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(5, y, w - 5, y);
    y += 3;
  };

  // Header
  doc.setFont("helvetica", "bold");
  center(data.restaurantName.toUpperCase(), 12);
  y += 1;

  doc.setFont("helvetica", "normal");
  if (data.restaurantAddress) center(data.restaurantAddress, 7);
  if (data.restaurantPhone) center(`Tel: ${data.restaurantPhone}`, 7);
  y += 2;
  line();

  // Title
  doc.setFont("helvetica", "bold");
  center("CONFIRMATION DE RESERVATION", 9);
  y += 2;
  line();

  // Reservation info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Ref: #${data.reservationId.slice(0, 8).toUpperCase()}`, 5, y); y += 4;
  doc.text(`Date: ${new Date(data.reservationDate).toLocaleDateString("fr-FR")}`, 5, y); y += 4;
  doc.text(`Heure: ${data.reservationTime.slice(0, 5)}`, 5, y); y += 4;
  doc.text(`Personnes: ${data.partySize}`, 5, y); y += 4;
  y += 1;
  line();

  doc.text(`Client: ${data.customerName}`, 5, y); y += 4;
  doc.text(`Tel: ${data.customerPhone}`, 5, y); y += 4;

  const statusLabels: Record<string, string> = {
    en_attente: "En attente",
    acceptee: "Acceptee",
    refusee: "Refusee",
  };
  doc.setFont("helvetica", "bold");
  doc.text(`Statut: ${statusLabels[data.status] || data.status}`, 5, y); y += 4;
  doc.setFont("helvetica", "normal");

  if (data.notes) {
    y += 1;
    doc.text(`Notes: ${data.notes}`, 5, y, { maxWidth: w - 10 }); y += 6;
  }

  y += 2;
  line();
  center("Merci pour votre reservation !", 8);
  center("Powered by MenuUp", 6);

  doc.save(`reservation-${data.reservationId.slice(0, 8)}.pdf`);
}
