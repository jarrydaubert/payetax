🏆 "Achievements" System - Refined Approach

  What You're Describing

  Achievement Unlock Flow:
  1. User completes tax calculation
  2. User reads a blog post (engagement!)
  3. System generates QR code → Achievement unlocked
  4. User scans QR → Claims SBT to wallet (optional)

  Why This Is Better:

  ✅ FCA Perspective:
  - "Achievement" = clearly gamification (not investment)
  - Educational requirement (read blog) = utility purpose
  - QR code = portable proof (works without wallet)
  - Delayed wallet connection = less friction

  ✅ UX Perspective:
  - No wallet required to GET achievement
  - Print/save QR code for records
  - Claim to wallet later (optional)
  - Works on mobile easily

  ✅ Engagement:
  - Drives blog traffic (+20-30% reading time)
  - Completion mechanic (calculator + learning)
  - Shareable achievement (social proof)

  ---
  🎮 Implementation Design

  Achievement Types

  Level 1: "Tax Learner" 🎓
  Requirements:
  ✅ Complete 1 tax calculation
  ✅ Read 1 blog post (>90% scroll depth)

  Reward:
  → QR code generated
  → "Tax Learner 2025" achievement
  → Can claim SBT or save as image

  Level 2: "Tax Expert" 📊
  Requirements:
  ✅ Complete 3+ calculations
  ✅ Read 3+ blog posts
  ✅ Compare different scenarios (monthly vs annual)

  Reward:
  → "Tax Expert 2025" achievement
  → Enhanced QR with more data

  Level 3: "Tax Pro" 💼
  Requirements:
  ✅ Complete 10+ calculations
  ✅ Read 5+ blog posts
  ✅ Use all features (Scottish, student loan, pension)

  Reward:
  → "Tax Pro 2025" achievement
  → Special QR design

  ---
  📱 User Flow (Mobile-First)

  Flow 1: Generate Achievement

  1. User on calculator → Completes calculation
     Status: 1/2 ✅ Calculator used

  2. Banner appears: "📖 Read a blog post to unlock achievement"

  3. User taps → Redirected to blog

  4. User reads post (tracked via scroll depth 90%+)
     Status: 2/2 ✅ Blog read

  5. 🎉 Achievement Unlocked!

  6. Modal shows:
     ┌─────────────────────────┐
     │  🏆 Achievement Unlocked │
     │                         │
     │   Tax Learner 2025      │
     │                         │
     │   [QR CODE IMAGE]       │
     │                         │
     │ ⬇️ Save Image            │
     │ 🔗 Claim to Wallet       │
     │ 📤 Share                 │
     └─────────────────────────┘

  Flow 2: Claim to Wallet (Optional)

  1. User taps "Claim to Wallet"

  2. WalletConnect modal opens

  3. User connects MetaMask/Wallet

  4. Backend mints SBT to their address

  5. Confirmation: "Achievement claimed! Check your wallet."

  ---
  🔧 Technical Implementation

  Phase 1: Achievement Tracking (No Blockchain Yet)

  Simple version using localStorage + QR:

  // src/lib/achievements.ts
  interface Achievement {
    id: string;
    name: string;
    description: string;
    earnedAt: string;
    calculationUsed: boolean;
    blogPostRead: boolean;
    qrCodeData: string; // JSON encoded achievement proof
  }

  // Track progress
  function trackCalculatorUse() {
    const progress = getAchievementProgress();
    progress.calculationUsed = true;

    if (progress.calculationUsed && progress.blogPostRead) {
      unlockAchievement('tax-learner-2025');
    }
  }

  function trackBlogRead(postSlug: string, scrollDepth: number) {
    if (scrollDepth >= 90) {
      const progress = getAchievementProgress();
      progress.blogPostRead = true;

      if (progress.calculationUsed && progress.blogPostRead) {
        unlockAchievement('tax-learner-2025');
      }
    }
  }

  // Generate QR code
  function generateAchievementQR(achievement: Achievement) {
    const data = {
      achievement: achievement.name,
      earnedAt: achievement.earnedAt,
      taxYear: '2024-25',
      // Signature for verification (SHA-256 hash)
      signature: hashAchievement(achievement),
    };

    // Generate QR using qrcode.react
    return encodeQRCode(JSON.stringify(data));
  }

  Phase 2: SBT Smart Contract (ERC-721 Non-Transferable)

  // contracts/PayeTaxAchievements.sol
  pragma solidity ^0.8.20;

  import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

  contract PayeTaxAchievements is ERC721 {
      // Non-transferable (Soulbound)
      function _beforeTokenTransfer(
          address from,
          address to,
          uint256 tokenId
      ) internal virtual override {
          require(from == address(0), "SBT: Achievements are non-transferable");
          super._beforeTokenTransfer(from, to, tokenId);
      }

      // Mint achievement
      function mintAchievement(
          address to,
          string memory achievementType,
          uint256 earnedAt
      ) public onlyOwner {
          uint256 tokenId = totalSupply + 1;
          _mint(to, tokenId);
          // Store metadata on-chain or IPFS
      }
  }

  Phase 3: Backend API for Verification

  // src/app/api/achievements/claim/route.ts
  export async function POST(request: Request) {
    const { qrData, walletAddress } = await request.json();

    // 1. Verify QR signature (prevent fake achievements)
    const isValid = verifyAchievementSignature(qrData);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid achievement' }, { status: 400 });
    }

    // 2. Check if already claimed
    const alreadyClaimed = await checkIfClaimed(qrData.signature);
    if (alreadyClaimed) {
      return NextResponse.json({ error: 'Already claimed' }, { status: 400 });
    }

    // 3. Mint SBT to wallet
    const tx = await mintSBT(walletAddress, qrData.achievement);

    // 4. Mark as claimed
    await markAsClaimed(qrData.signature, walletAddress);

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash,
      openSeaUrl: `https://opensea.io/assets/.../${tx.tokenId}`
    });
  }

  ---
  🎨 UI Components

  Achievement Modal Component

  // src/components/molecules/AchievementModal.tsx
  'use client';

  import { Dialog, DialogContent } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import QRCode from 'qrcode.react';
  import { Download, Share2, Wallet } from 'lucide-react';

  interface AchievementModalProps {
    achievement: {
      name: string;
      description: string;
      earnedAt: string;
      qrData: string;
    };
    open: boolean;
    onClose: () => void;
  }

  export function AchievementModal({ achievement, open, onClose }: AchievementModalProps) {
    const handleDownloadQR = () => {
      // Download QR as PNG
      const canvas = document.querySelector('canvas');
      const url = canvas?.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url!;
      a.download = `achievement-${achievement.name}.png`;
      a.click();
    };

    const handleClaimToWallet = async () => {
      // Open WalletConnect flow
      // Call /api/achievements/claim
    };

    const handleShare = async () => {
      if (navigator.share) {
        await navigator.share({
          title: `I earned: ${achievement.name}`,
          text: achievement.description,
          url: window.location.href,
        });
      }
    };

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          {/* Glassmorphism card */}
          <div className="space-y-6 text-center">
            <div className="text-5xl">🏆</div>

            <div>
              <h2 className="text-2xl font-bold mb-2">{achievement.name}</h2>
              <p className="text-muted-foreground">{achievement.description}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCode 
                value={achievement.qrData} 
                size={200}
                level="H"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              This achievement has no financial value and serves solely as
              proof of calculator usage and tax education.
            </p>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={handleDownloadQR}>
                <Download className="mr-2 size-4" />
                Save
              </Button>

              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 size-4" />
                Share
              </Button>

              <Button onClick={handleClaimToWallet}>
                <Wallet className="mr-2 size-4" />
                Claim
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  Achievement Progress Banner

  // src/components/molecules/AchievementProgress.tsx
  export function AchievementProgress() {
    const progress = useAchievementProgress();

    if (progress.calculationUsed && !progress.blogPostRead) {
      return (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📖</div>
            <div className="flex-1">
              <h3 className="font-semibold">Almost there!</h3>
              <p className="text-sm text-muted-foreground">
                Read a blog post to unlock your first achievement
              </p>
            </div>
            <Button asChild>
              <Link href="/blog">Read Blog</Link>
            </Button>
          </div>
        </div>
      );
    }

    return null;
  }

  ---
  📊 Tracking & Analytics

  Events to Track (GA4)

  // When calculator completes
  gtag('event', 'achievement_progress', {
    achievement: 'tax-learner-2025',
    step: 'calculator_complete',
    progress: 50, // 1 of 2 requirements
  });

  // When blog read
  gtag('event', 'achievement_progress', {
    achievement: 'tax-learner-2025',
    step: 'blog_read',
    progress: 100, // 2 of 2 requirements
  });

  // When achievement unlocked
  gtag('event', 'achievement_unlock', {
    achievement: 'tax-learner-2025',
    method: 'qr_generated',
  });

  // When claimed to wallet
  gtag('event', 'achievement_claim', {
    achievement: 'tax-learner-2025',
    wallet_type: 'metamask',
  });

  ---
  💰 Cost Analysis

  Development (v1.3.0 Target)

  Phase 1: QR Achievement System (No Blockchain)
  - Time: 2-3 days
  - Cost: £0 (just dev time)
  - Delivers: QR codes, tracking, modals

  Phase 2: Smart Contract + Wallet Integration
  - Time: 3-4 days
  - Cost breakdown:
    - Legal review: £300-400 (one-time)
    - Smart contract audit: £500-1000 (optional but recommended)
    - Gas fees (deploy to Polygon): ~£20-50
    - IPFS hosting (Pinata free tier): £0
  - Total: £820-1,450 one-time

  Phase 3: Ongoing Costs
  - Minting gas fees: ~£0.01-0.10 per achievement (Polygon L2)
  - IPFS storage: £0 (free tier, ~1000 pins)
  - Monitoring: £0 (Sentry already covers)

  ---
  🗓️ Proposed Timeline (v1.3.0)

  Week 1: Legal & Design

  - Consult UK fintech lawyer (£300-400)
  - Design achievement types + QR layout
  - Write Privacy Policy updates
  - Create user documentation

  Week 2: Phase 1 Implementation

  - Build achievement tracking system
  - Add QR code generation
  - Create AchievementModal component
  - Test on mobile (iOS + Android)

  Week 3: Phase 2 Implementation

  - Deploy smart contract (testnet first)
  - Integrate WalletConnect
  - Build claim API endpoint
  - Smart contract audit (optional)

  Week 4: Testing & Launch

  - Beta test with 20 users
  - Monitor for issues
  - Full public launch
  - GA4 tracking verification

  Target: November 2025 (v1.3.0 feature)

  ---
  ✅ FCA Compliance Checklist

  With "achievements" + QR approach:

  - No financial value - Explicitly stated
  - Educational purpose - Read blog requirement
  - Free to obtain - No payment needed
  - Optional wallet - QR works standalone
  - Clear disclaimers - On all modals
  - Non-transferable - SBT standard
  - GDPR compliant - Wallet optional, no PII
  - Privacy Policy updated - Wallet usage disclosed

  Risk Level: ✅ Very Low (even safer than before)
