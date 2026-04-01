import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

const QrCodeView = ({ restaurant }: { restaurant: any }) => {
  const url = `${window.location.origin}/restaurant/${restaurant.slug}`;
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${restaurant.slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-bold">QR Code</h1>
        <p className="text-muted-foreground text-sm">Partagez votre menu via un QR code imprimable.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-4">
        <div ref={qrRef} className="w-48 h-48 mx-auto bg-white rounded-2xl flex items-center justify-center p-3">
          <QRCodeCanvas value={url} size={168} level="H" includeMargin={false} />
        </div>
        <p className="text-sm text-muted-foreground break-all">{url}</p>
        <Button onClick={handleDownload} className="gradient-primary text-primary-foreground shadow-warm rounded-xl">
          <Download className="h-4 w-4 mr-2" />
          Télécharger en PNG
        </Button>
      </div>

      <div className="bg-secondary/50 rounded-2xl p-5 space-y-2">
        <h3 className="font-bold text-sm">💡 Comment l'utiliser ?</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Imprimez-le sur vos tables ou vos flyers</li>
          <li>• Collez-le sur votre vitrine</li>
          <li>• Partagez-le sur vos réseaux sociaux</li>
        </ul>
      </div>
    </div>
  );
};

export default QrCodeView;
