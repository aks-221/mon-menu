import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>
      <h1 className="text-3xl font-extrabold mb-8">Politique de Confidentialité</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString("fr-FR")}</p>

        <h2 className="text-lg font-bold text-foreground">1. Données collectées</h2>
        <p>SamaMenu collecte les données suivantes :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Restaurants :</strong> nom, adresse, téléphone, email, logo, informations du menu</li>
          <li><strong>Clients :</strong> nom, numéro de téléphone, adresse de livraison (lors d'une commande)</li>
          <li><strong>Données techniques :</strong> adresse IP, type de navigateur, pages visitées</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground">2. Utilisation des données</h2>
        <p>Les données collectées servent à :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Fournir et améliorer le service</li>
          <li>Traiter les commandes et réservations</li>
          <li>Communiquer avec les utilisateurs (notifications, support)</li>
          <li>Générer des statistiques anonymisées</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground">3. Partage des données</h2>
        <p>SamaMenu ne vend pas vos données. Les informations de commande (nom, téléphone, adresse) sont partagées uniquement avec le restaurant concerné pour le traitement de la commande.</p>

        <h2 className="text-lg font-bold text-foreground">4. Sécurité</h2>
        <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, modification ou destruction.</p>

        <h2 className="text-lg font-bold text-foreground">5. Conservation des données</h2>
        <p>Les données des comptes sont conservées tant que le compte est actif. Après suppression d'un compte, les données sont effacées dans un délai de 30 jours, sauf obligation légale de conservation.</p>

        <h2 className="text-lg font-bold text-foreground">6. Droits des utilisateurs</h2>
        <p>Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous via WhatsApp au +221 77 817 75 75.</p>

        <h2 className="text-lg font-bold text-foreground">7. Cookies</h2>
        <p>SamaMenu utilise des cookies techniques nécessaires au fonctionnement du service. Aucun cookie publicitaire n'est utilisé.</p>

        <h2 className="text-lg font-bold text-foreground">8. Contact</h2>
        <p>Pour toute question relative à la protection de vos données, contactez-nous via WhatsApp au +221 77 817 75 75.</p>
      </div>
    </div>
  </div>
);

export default Privacy;
