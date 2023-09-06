import React, { useState, useEffect } from "react";
import { RepostQuoteModal } from "./RepostQuoteModal"; // Import RepostQuoteModal
import { QuoteModal } from "./QuoteModal"; // Import QuoteModal

function ParentComponent({
  buttonPosition,
  reposted,
  twitterHandle,
  inscriptionid,
  quotedInscriptionContent,
  reposts,
  inscriptor,
  elapsedTime,
}) {
  const [repostModalOpen, setRepostModalOpen] = useState(true);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false); 
  const [isInitialEffectComplete, setIsInitialEffectComplete] = useState(false);

  useEffect(() => {
    if (repostModalOpen === true && quoteModalOpen === false) {
      setIsInitialEffectComplete(true);
    }
  }, []);

return (
    <>
      {isInitialEffectComplete && repostModalOpen && (
        <RepostQuoteModal
          onClose={() => setRepostModalOpen(false)}
          buttonPosition={buttonPosition}
          reposted={reposted}
          twitterHandle={twitterHandle}
          inscriptionid={inscriptionid}
          quotedInscriptionContent={quotedInscriptionContent}
          reposts={reposts}
          quoteModalOpen={quoteModalOpen} 
          setQuoteModalOpen={setQuoteModalOpen}
        />
      )}

      {isInitialEffectComplete && quoteModalOpen && (
        <QuoteModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          inscriptionid={inscriptionid}
          quotedInscriptionContent={quotedInscriptionContent}
          twitterHandle={twitterHandle}
          inscriptor={inscriptor} 
          elapsedTime={elapsedTime}
        />
      )}
    </>
  );
}

export default ParentComponent;

