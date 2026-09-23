import React from 'react';

const formatDate = (value) => {
  if (!value) return '[EFFECTIVE DATE]';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

export default function MutualNdaDocument({ data = {}, contract = null }) {
  const { partnerInfo = {}, nda = {} } = data;
  const partnerName = partnerInfo.companyName || partnerInfo.name || '[PARTNER LEGAL NAME]';
  const representative = partnerInfo.repName || partnerInfo.name || '[AUTHORIZED REPRESENTATIVE]';
  const term = nda.termYears || '3';
  const confidentiality = nda.confidentialityYears || '5';
  const state = nda.state || 'Texas';
  const county = nda.county || 'Ellis County';
  const purpose = nda.purpose || 'evaluating and pursuing a potential business, development, referral, creative, technology, or other strategic relationship between the Parties';

  return (
    <div className="bg-white rounded p-8 sm:p-12 shadow-2xl print-contract-preview" style={{ fontFamily: 'Times New Roman, serif' }}>
      <article className="text-black text-[0.92rem] leading-[1.75]">
        <header className="text-center border-b-2 border-black pb-5">
          <p className="text-[0.7rem] tracking-[0.28em] font-bold uppercase mb-2">Evo Brand Concepts</p>
          <h2 className="text-2xl font-bold uppercase tracking-wider">Mutual Non-Disclosure Agreement</h2>
          <p className="mt-2 text-sm">Effective {formatDate(nda.effectiveDate)}</p>
        </header>

        <p className="mt-7 mb-5">
          This Mutual Non-Disclosure Agreement (the &ldquo;Agreement&rdquo;) is entered into by and between <strong>EVOBRAND Concepts LLC</strong>, an entity located in Ellis County, Texas (&ldquo;EVOBRAND&rdquo;), and <strong>{partnerName}</strong>{partnerInfo.address ? `, located at ${partnerInfo.address}` : ''} (&ldquo;Partner&rdquo;). EVOBRAND and Partner are each a &ldquo;Party&rdquo; and together the &ldquo;Parties.&rdquo;
        </p>

        <Section number="1" title="Purpose">
          The Parties wish to exchange certain non-public information solely for the purpose of {purpose} (the &ldquo;Purpose&rdquo;). Nothing in this Agreement requires either Party to proceed with any proposed transaction or relationship.
        </Section>

        <Section number="2" title="Confidential Information">
          &ldquo;Confidential Information&rdquo; means non-public information disclosed by or on behalf of one Party (the &ldquo;Disclosing Party&rdquo;) to the other (the &ldquo;Receiving Party&rdquo;), whether before or after the Effective Date and whether communicated orally, visually, electronically, in writing, or by access to systems or facilities, that is marked confidential or that a reasonable person would understand to be confidential given its nature and the circumstances of disclosure. It includes business plans, pricing, financial information, customer and prospect information, source code, software, credentials, system architecture, product plans, inventions, designs, processes, data, trade secrets, marketing plans, research, and the existence and substance of the Parties&apos; discussions.
        </Section>

        <Section number="3" title="Exclusions">
          Confidential Information does not include information the Receiving Party can document: (a) is or becomes publicly available without breach of this Agreement; (b) was lawfully known to the Receiving Party without restriction before disclosure; (c) is received lawfully from a third party without a duty of confidentiality; or (d) is independently developed without use of or reference to the Disclosing Party&apos;s Confidential Information.
        </Section>

        <Section number="4" title="Mutual Duties">
          Each Receiving Party shall: (a) use Confidential Information only for the Purpose; (b) protect it using at least reasonable care and no less care than it uses for its own similar information; (c) disclose it only to its employees, contractors, professional advisers, and financing sources who need to know it for the Purpose and are bound by confidentiality obligations at least as protective as this Agreement; and (d) remain responsible for any breach by those persons. Neither Party may reverse engineer, decompile, or disassemble prototypes, software, or other materials supplied under this Agreement except to the extent such restriction is prohibited by law.
        </Section>

        <Section number="5" title="Required Disclosures">
          A Receiving Party may disclose Confidential Information when required by law, subpoena, or court order, provided it gives prompt written notice to the Disclosing Party when legally permitted, reasonably cooperates at the Disclosing Party&apos;s expense in seeking protective treatment, and discloses only the portion legally required.
        </Section>

        <Section number="6" title="Security and Incident Notice">
          Each Receiving Party shall maintain reasonable administrative, technical, and physical safeguards appropriate to the sensitivity of the Confidential Information. It shall promptly notify the Disclosing Party after discovering unauthorized access, use, or disclosure and reasonably cooperate to contain and remediate the incident. This Agreement does not by itself authorize either Party to share regulated personal, health, payment-card, or similarly sensitive data; any such exchange requires a separate written data-protection agreement.
        </Section>

        <Section number="7" title="Ownership; No License; No Warranty">
          All Confidential Information remains the property of the Disclosing Party. No license or other intellectual-property right is granted except the limited right to use Confidential Information for the Purpose. Each Party provides its Confidential Information &ldquo;as is&rdquo; and makes no warranty as to accuracy or completeness. This Agreement does not transfer ownership of work product or create a partnership, joint venture, employment, fiduciary, agency, exclusivity, non-solicitation, or non-competition obligation.
        </Section>

        <Section number="8" title="Return or Destruction">
          Upon written request or the end of discussions, the Receiving Party shall promptly stop using and, within thirty (30) days, return or destroy the Disclosing Party&apos;s Confidential Information and certify destruction upon request. The Receiving Party may retain one archival copy solely for legal compliance and information contained in routine backups that cannot reasonably be isolated, provided all retained information remains protected and is not used for any other purpose.
        </Section>

        <Section number="9" title="Term and Survival">
          This Agreement begins on the Effective Date and continues for <strong>{term} years</strong> unless ended earlier by either Party on written notice. The confidentiality and use restrictions survive for <strong>{confidentiality} years</strong> after each disclosure; however, information qualifying as a trade secret remains protected for as long as it qualifies as a trade secret under applicable law.
        </Section>

        <Section number="10" title="Protected Disclosures and Trade-Secret Immunity">
          Nothing in this Agreement prohibits or restricts either Party or any individual from reporting possible violations of law to a government agency or attorney, cooperating with an investigation, making other disclosures protected by law, or receiving a whistleblower award. Under 18 U.S.C. § 1833(b), an individual will not be held criminally or civilly liable under federal or state trade-secret law for disclosing a trade secret in confidence to a government official or attorney solely to report or investigate a suspected legal violation, or in a court filing made under seal. An individual bringing a retaliation claim may disclose the trade secret to counsel and use it in the proceeding if filings containing it are under seal and disclosure is otherwise limited as the law requires.
        </Section>

        <Section number="11" title="Equitable Relief">
          The Parties agree that unauthorized use or disclosure may cause harm that money damages cannot adequately remedy. The injured Party may seek temporary, preliminary, or permanent injunctive relief, in addition to other remedies available at law or equity, without waiving any defenses or being required to prove actual damages. Any bond requirement remains subject to applicable law and the court&apos;s discretion.
        </Section>

        <Section number="12" title="Governing Law and Venue">
          This Agreement is governed by the laws of the State of <strong>{state}</strong>, without regard to conflict-of-law rules. Subject to either Party&apos;s right to seek urgent injunctive relief in a court of competent jurisdiction, the Parties consent to exclusive jurisdiction and venue in the state or federal courts serving <strong>{county}, {state}</strong>.
        </Section>

        <Section number="13" title="General Terms">
          This Agreement is the entire agreement concerning its subject matter and supersedes prior discussions on that subject. Any amendment or waiver must be in writing and signed by both Parties. Neither Party may assign this Agreement without the other Party&apos;s written consent, except to a successor in a merger, reorganization, or sale of substantially all relevant assets that assumes this Agreement. If any provision is unenforceable, it will be modified only as necessary and the remainder will continue in effect. A waiver on one occasion is not a waiver on another. Notices must be sent to the contact information below. Counterparts and electronic signatures are permitted and together form one instrument.
        </Section>

        <p className="mt-8 mb-10 font-semibold">The Parties intend to be legally bound and have executed this Agreement through their authorized representatives.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14">
          <SignatureBlock
            heading="EVOBRAND Concepts LLC"
            signature="Keisha Solomon"
            name="Keisha Solomon"
            title="CEO"
            email="info@evobrand.net"
            date={formatDate(nda.effectiveDate)}
          />
          <SignatureBlock
            heading={partnerName}
            signature={contract?.client_signature || ''}
            name={contract?.client_signature || representative}
            title={partnerInfo.title || '[TITLE]'}
            email={partnerInfo.email || '[EMAIL]'}
            date={contract?.client_signed_at ? formatDate(contract.client_signed_at.slice(0, 10)) : '[DATE SIGNED]'}
          />
        </div>
      </article>
    </div>
  );
}

function Section({ number, title, children }) {
  return <section className="mb-4"><h3 className="font-bold uppercase mb-1">{number}. {title}</h3><p>{children}</p></section>;
}

function SignatureBlock({ heading, signature, name, title, email, date }) {
  return (
    <div>
      <div className="border-b border-black min-h-9 pb-1 text-xl" style={{ fontFamily: "'Brush Script MT', cursive" }}>{signature}</div>
      <p className="font-bold uppercase text-sm mt-2">{heading}</p>
      <p className="text-sm">By: {name}</p><p className="text-sm">Title: {title}</p>
      <p className="text-sm">Email: {email}</p><p className="text-sm">Date: {date}</p>
    </div>
  );
}
