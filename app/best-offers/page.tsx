import "./best-offers.css";
import "../gamePage.css";

const promotedOffers = [
  {
    name: 'Candy AI',
    image: 'https://ads.storeflz.com/logo-2.png',
    url: 'https://t.vlmai-1.com/384478/9022/0?aff_sub5=SF_006OG000004lmDN',
    offer: '70% OFF Limited-Time',
    description: 'Create your perfect AI girlfriend and chat without limits.',
  } ,{
    name: 'StripChat',
    image: 'https://ads.storeflz.com/ratio3x2_960.webp',
    url: 'https://t.acrsmartcam.com/384478/3778/8996?po=6533&aff_sub5=SF_006OG000004lmDN',
    offer: '25% OFF Tokens',
    description: 'Connect instantly and enjoy exclusive premium experiences.',
  },
  {
    name: 'OurDream AI',
    image: 'https://ads.storeflz.com/CR-842_Design-25712_CROffePage_CRXOurdream.ai_Img-1080x955-1.webp',
    url: 'https://t.vlmai-1.com/384478/7710?aff_sub5=SF_006OG000004lmDN',
    offer: '75% OFF Premium Access',
    description: 'Enjoy more than a million AI girls on your terms without limits.',
  },
 
];

export default function BestOffersPage() {
  return (
    <>

      <div className="best-offers-page">
        <div className="best-offers-header">
          <span className="best-offers-tag">
            Exclusive Deals
          </span>

          <h1 className="best-offers-title">
            Best Offers from Lustiie
          </h1>

          <p className="best-offers-subtitle">
            Hand-picked platforms with exclusive discounts,
            premium access offers and limited-time promotions.
          </p>
        </div>

        <div className="best-offers-grid">
          {promotedOffers.map((offer) => (
            <a
              key={offer.url}
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="best-offers-card"
            >
              <div className="best-offers-image-wrap">
                <img
                  src={offer.image}
                  alt={offer.name}
                  className="best-offers-image"
                />

                <div className="best-offers-offer-badge">
                  {offer.offer}
                </div>
              </div>

              <div className="best-offers-content">
                <h3>{offer.name}</h3>

                <p>
                  {offer.description}
                </p>

                <div className="best-offers-button">
                  Claim Offer
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}