import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </Link>
      <h1 className="text-3xl font-extrabold mb-8">Conditions Générales d'Utilisation</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString("fr-FR")}</p>

        <h2 className="text-lg font-bold text-foreground">1. Objet</h2>
        <p>Les présentes conditions régissent l'utilisation de la plateforme SamaMenu, un service SaaS permettant aux restaurants de créer leur menu en ligne, recevoir des commandes et gérer leurs réservations.</p>

        <h2 className="text-lg font-bold text-foreground">2. Inscription</h2>
        <p>L'inscription est gratuite et donne accès à un essai de 15 jours. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants de connexion.</p>

        <h2 className="text-lg font-bold text-foreground">3. Essai gratuit et abonnement</h2>
        <p>Chaque restaurant bénéficie d'un essai gratuit de 15 jours avec accès complet. À l'issue de cette période, un abonnement de 6 600 FCFA/mois est requis pour continuer à utiliser le service. Le paiement s'effectue via Wave ou virement bancaire.</p>

        <h2 className="text-lg font-bold text-foreground">4. Obligations de l'utilisateur</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ne pas utiliser le service à des fins illégales</li>
          <li>Fournir des informations exactes sur son restaurant (menu, prix, horaires)</li>
          <li>Ne pas tenter de contourner les mesures de sécurité de la plateforme</li>
          <li>Respecter la propriété intellectuelle de SamaMenu</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground">5. Responsabilité</h2>
        <p>SamaMenu met tout en œuvre pour assurer la disponibilité du service mais ne peut garantir un fonctionnement ininterrompu. SamaMenu ne saurait être tenu responsable des transactions entre les restaurants et leurs clients.</p>

        <h2 className="text-lg font-bold text-foreground">6. Résiliation</h2>
        <p>L'utilisateur peut résilier son abonnement à tout moment. L'accès reste actif jusqu'à la fin de la période payée. SamaMenu se réserve le droit de suspendre un compte en cas de non-respect des présentes conditions.</p>

        <h2 className="text-lg font-bold text-foreground">7. Propriété intellectuelle</h2>
        <p>Tous les éléments de la plateforme (design, code, marque) sont la propriété exclusive de SamaMenu. Les contenus publiés par les restaurants (photos, descriptions) restent leur propriété.</p>

        <h2 className="text-lg font-bold text-foreground">8. Contact</h2>
        <p>Pour toute question relative aux présentes conditions, contactez-nous via WhatsApp au +221 77 817 75 75.</p>
      </div>
    </div>
  </div>
);

export default Terms;
