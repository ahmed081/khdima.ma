import { getLocale } from "next-intl/server"

export default async function TermsPage() {
  const locale = await getLocale()
  const isRTL  = locale === 'ar'

  return (
    <main className="min-h-screen bg-white py-16" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-3xl prose prose-gray">
        {locale === 'ar' ? (
          <>
            <h1>شروط الاستخدام</h1>
            <p className="text-gray-500">آخر تحديث: مارس 2026</p>
            <h2>1. قبول الشروط</h2>
            <p>باستخدام khdimti.com، فإنك توافق على هذه الشروط. إذا لم توافق، يرجى عدم استخدام المنصة.</p>
            <h2>2. طبيعة المنصة</h2>
            <p>khdimti.com هي منصة تربط العملاء بمزودي الخدمات المنزلية. لا نقوم بمعالجة المدفوعات ولسنا طرفاً في المعاملات بين العملاء والمزودين.</p>
            <h2>3. مزودو الخدمات</h2>
            <p>يجب على مزودي الخدمات تقديم معلومات صحيحة ودقيقة. نحتفظ بالحق في رفض أو تعليق أي حساب يخالف هذه الشروط.</p>
            <h2>4. التقييمات</h2>
            <p>يجب أن تكون التقييمات صادقة ومبنية على تجربة حقيقية. يُحظر نشر تقييمات مزيفة أو مضللة.</p>
            <h2>5. المسؤولية</h2>
            <p>لا تتحمل khdimti.com المسؤولية عن جودة الخدمات المقدمة من طرف مزودي الخدمات.</p>
            <h2>6. التعديلات</h2>
            <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين عبر المنصة.</p>
          </>
        ) : locale === 'en' ? (
          <>
            <h1>Terms of Use</h1>
            <p className="text-gray-500">Last updated: March 2026</p>
            <h2>1. Acceptance of Terms</h2>
            <p>By using khdimti.com, you agree to these terms. If you do not agree, please do not use the platform.</p>
            <h2>2. Nature of the Platform</h2>
            <p>khdimti.com is a platform connecting customers with home service providers. We do not process payments and are not a party to transactions between customers and providers.</p>
            <h2>3. Service Providers</h2>
            <p>Providers must provide accurate and truthful information. We reserve the right to reject or suspend any account that violates these terms.</p>
            <h2>4. Reviews</h2>
            <p>Reviews must be honest and based on real experience. Posting fake or misleading reviews is prohibited.</p>
            <h2>5. Liability</h2>
            <p>khdimti.com is not responsible for the quality of services provided by service providers.</p>
            <h2>6. Modifications</h2>
            <p>We reserve the right to modify these terms at any time. Users will be notified through the platform.</p>
          </>
        ) : (
          <>
            <h1>Conditions d'utilisation</h1>
            <p className="text-gray-500">Dernière mise à jour : mars 2026</p>
            <h2>1. Acceptation des conditions</h2>
            <p>En utilisant khdimti.com, vous acceptez ces conditions. Si vous n'êtes pas d'accord, veuillez ne pas utiliser la plateforme.</p>
            <h2>2. Nature de la plateforme</h2>
            <p>khdimti.com est une plateforme mettant en relation des clients avec des prestataires de services à domicile. Nous ne traitons pas les paiements et ne sommes pas partie aux transactions entre clients et prestataires.</p>
            <h2>3. Prestataires de services</h2>
            <p>Les prestataires doivent fournir des informations exactes et véridiques. Nous nous réservons le droit de refuser ou de suspendre tout compte qui ne respecte pas ces conditions.</p>
            <h2>4. Avis clients</h2>
            <p>Les avis doivent être honnêtes et basés sur une expérience réelle. La publication de faux avis est interdite.</p>
            <h2>5. Responsabilité</h2>
            <p>khdimti.com n'est pas responsable de la qualité des services fournis par les prestataires.</p>
            <h2>6. Modifications</h2>
            <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs en seront informés via la plateforme.</p>
          </>
        )}
      </div>
    </main>
  )
}
