import { getLocale } from "next-intl/server"

export default async function PrivacyPage() {
  const locale = await getLocale()
  const isRTL  = locale === 'ar'

  return (
    <main className="min-h-screen bg-white py-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-3xl prose prose-gray">
        {locale === 'ar' ? (
          <>
            <h1>سياسة الخصوصية</h1>
            <p className="text-gray-500">آخر تحديث: مارس 2026</p>
            <h2>1. البيانات التي نجمعها</h2>
            <p>نجمع المعلومات التي تقدمها عند إنشاء حساب أو تسجيل نشاطك التجاري: الاسم، البريد الإلكتروني، رقم الهاتف، والمدينة.</p>
            <h2>2. كيف نستخدم بياناتك</h2>
            <p>نستخدم بياناتك لتشغيل المنصة، وعرض ملفك الشخصي للعملاء المحتملين، وتحسين تجربة الاستخدام.</p>
            <h2>3. مشاركة البيانات</h2>
            <p>لا نبيع بياناتك لأطراف ثالثة. يتم عرض معلومات الاتصال بمزودي الخدمة للعملاء فقط عبر المنصة.</p>
            <h2>4. الأمان</h2>
            <p>نستخدم تشفير SSL وكلمات مرور مشفرة لحماية بياناتك.</p>
            <h2>5. حقوقك</h2>
            <p>يمكنك طلب حذف حسابك وبياناتك في أي وقت عبر التواصل معنا على: contact@khdimti.com</p>
            <h2>6. التواصل</h2>
            <p>لأي استفسار: <a href="mailto:contact@khdimti.com">contact@khdimti.com</a></p>
          </>
        ) : locale === 'en' ? (
          <>
            <h1>Privacy Policy</h1>
            <p className="text-gray-500">Last updated: March 2026</p>
            <h2>1. Data We Collect</h2>
            <p>We collect information you provide when creating an account or registering your business: name, email, phone number, and city.</p>
            <h2>2. How We Use Your Data</h2>
            <p>We use your data to operate the platform, display your profile to potential customers, and improve the user experience.</p>
            <h2>3. Data Sharing</h2>
            <p>We do not sell your data to third parties. Provider contact information is only shown to customers through the platform.</p>
            <h2>4. Security</h2>
            <p>We use SSL encryption and hashed passwords to protect your data.</p>
            <h2>5. Your Rights</h2>
            <p>You may request deletion of your account and data at any time by contacting us at: contact@khdimti.com</p>
            <h2>6. Contact</h2>
            <p>For any questions: <a href="mailto:contact@khdimti.com">contact@khdimti.com</a></p>
          </>
        ) : (
          <>
            <h1>Politique de confidentialité</h1>
            <p className="text-gray-500">Dernière mise à jour : mars 2026</p>
            <h2>1. Données collectées</h2>
            <p>Nous collectons les informations que vous fournissez lors de la création d'un compte ou de l'inscription de votre activité : nom, email, téléphone, ville.</p>
            <h2>2. Utilisation de vos données</h2>
            <p>Vos données sont utilisées pour faire fonctionner la plateforme, afficher votre profil aux clients potentiels et améliorer l'expérience utilisateur.</p>
            <h2>3. Partage des données</h2>
            <p>Nous ne vendons pas vos données à des tiers. Les coordonnées des prestataires ne sont affichées qu'aux clients via la plateforme.</p>
            <h2>4. Sécurité</h2>
            <p>Nous utilisons le chiffrement SSL et des mots de passe hachés pour protéger vos données.</p>
            <h2>5. Vos droits</h2>
            <p>Vous pouvez demander la suppression de votre compte et de vos données à tout moment en nous contactant : contact@khdimti.com</p>
            <h2>6. Contact</h2>
            <p>Pour toute question : <a href="mailto:contact@khdimti.com">contact@khdimti.com</a></p>
          </>
        )}
      </div>
    </main>
  )
}
