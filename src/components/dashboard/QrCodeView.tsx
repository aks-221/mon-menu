import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";

const QrCodeView = () => {
  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-bold">QR Code</h1>
        <p className="text-muted-foreground text-sm">Partagez votre menu via un QR code imprimable.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-4">
        <div className="w-48 h-48 mx-auto bg-foreground rounded-2xl flex items-center justify-center">
          <div className="w-40 h-40 bg-background rounded-xl flex items-center justify-center">
            <QrCode className="h-32 w-32 text-foreground" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          menuup.app/<span className="font-medium text-foreground">chez-fatou</span>
        </p>
        <Button className="gradient-primary text-primary-foreground shadow-warm rounded-xl">
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
