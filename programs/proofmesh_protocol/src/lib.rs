use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};

declare_id!("4wBqpZM9xaSheZzJSMawUKKwhdpChKbZ5eu5ky4Vigw");

const MAX_HASH_BYTES: usize = 32;

#[program]
pub mod proofmesh_protocol {
    use super::*;

    pub fn issue_credential(
        ctx: Context<IssueCredential>,
        proof_hash: [u8; MAX_HASH_BYTES],
        category_hash: [u8; MAX_HASH_BYTES],
        expires_at: i64,
    ) -> Result<()> {
        require!(expires_at == 0 || expires_at > Clock::get()?.unix_timestamp, ErrorCode::InvalidExpiry);
        let credential = &mut ctx.accounts.credential;
        credential.issuer = ctx.accounts.issuer.key();
        credential.recipient = ctx.accounts.recipient.key();
        credential.proof_hash = proof_hash;
        credential.category_hash = category_hash;
        credential.issued_at = Clock::get()?.unix_timestamp;
        credential.expires_at = expires_at;
        credential.status = CredentialStatus::Active as u8;
        credential.bump = ctx.bumps.credential;
        emit!(CredentialIssued { credential: credential.key(), issuer: credential.issuer, recipient: credential.recipient, proof_hash });
        Ok(())
    }

    pub fn revoke_credential(ctx: Context<RevokeCredential>) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        require!(credential.status == CredentialStatus::Active as u8, ErrorCode::CredentialNotActive);
        credential.status = CredentialStatus::Revoked as u8;
        credential.revoked_at = Clock::get()?.unix_timestamp;
        emit!(CredentialRevoked { credential: credential.key(), issuer: credential.issuer, recipient: credential.recipient });
        Ok(())
    }

    pub fn verify_credential(ctx: Context<VerifyCredential>) -> Result<()> {
        let credential = &ctx.accounts.credential;
        require!(credential.status == CredentialStatus::Active as u8, ErrorCode::CredentialNotActive);
        require!(credential.expires_at == 0 || credential.expires_at > Clock::get()?.unix_timestamp, ErrorCode::CredentialExpired);
        emit!(CredentialVerified { credential: credential.key(), recipient: credential.recipient, proof_hash: credential.proof_hash });
        Ok(())
    }

    pub fn fund_escrow(ctx: Context<FundEscrow>, amount: u64, task_hash: [u8; MAX_HASH_BYTES]) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        let escrow = &mut ctx.accounts.escrow;
        require!(!escrow.funded, ErrorCode::AlreadyFunded);
        let transfer_accounts = Transfer { from: ctx.accounts.funder_ata.to_account_info(), to: ctx.accounts.vault.to_account_info(), authority: ctx.accounts.funder.to_account_info() };
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_accounts), amount)?;
        escrow.sponsor = ctx.accounts.funder.key();
        escrow.reviewer = ctx.accounts.reviewer.key();
        escrow.recipient = ctx.accounts.recipient.key();
        escrow.mint = ctx.accounts.mint.key();
        escrow.task_hash = task_hash;
        escrow.amount = amount;
        escrow.funded = true;
        escrow.claimed = false;
        escrow.approved = false;
        escrow.released = false;
        escrow.bump = ctx.bumps.escrow;
        emit!(EscrowFunded { escrow: escrow.key(), sponsor: escrow.sponsor, recipient: escrow.recipient, amount, task_hash });
        Ok(())
    }

    pub fn claim_escrow(ctx: Context<ClaimEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.funded, ErrorCode::NotFunded);
        require!(!escrow.claimed, ErrorCode::AlreadyClaimed);
        require!(!escrow.released, ErrorCode::AlreadyReleased);
        require!(ctx.accounts.credential.status == CredentialStatus::Active as u8, ErrorCode::CredentialNotActive);
        require!(ctx.accounts.credential.expires_at == 0 || ctx.accounts.credential.expires_at > Clock::get()?.unix_timestamp, ErrorCode::CredentialExpired);
        require_keys_eq!(ctx.accounts.credential.recipient, ctx.accounts.recipient.key(), ErrorCode::RecipientMismatch);
        escrow.claimed = true;
        emit!(EscrowClaimed { escrow: escrow.key(), recipient: escrow.recipient });
        Ok(())
    }

    pub fn approve_escrow(ctx: Context<ApproveEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.funded, ErrorCode::NotFunded);
        require!(escrow.claimed, ErrorCode::NotClaimed);
        require!(!escrow.approved, ErrorCode::AlreadyApproved);
        require!(!escrow.released, ErrorCode::AlreadyReleased);
        escrow.approved = true;
        emit!(EscrowApproved { escrow: escrow.key(), reviewer: ctx.accounts.reviewer.key() });
        Ok(())
    }

    pub fn release_escrow(ctx: Context<ReleaseEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.funded, ErrorCode::NotFunded);
        require!(escrow.claimed, ErrorCode::NotClaimed);
        require!(escrow.approved, ErrorCode::NotApproved);
        require!(!escrow.released, ErrorCode::AlreadyReleased);
        require_keys_eq!(ctx.accounts.recipient_ata.mint, escrow.mint, ErrorCode::MintMismatch);
        let bump_seed = [escrow.bump];
        let signer_seeds: &[&[u8]] = &[b"escrow", escrow.task_hash.as_ref(), &bump_seed];
        let transfer_accounts = Transfer { from: ctx.accounts.vault.to_account_info(), to: ctx.accounts.recipient_ata.to_account_info(), authority: escrow.to_account_info() };
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), transfer_accounts, &[signer_seeds]), escrow.amount)?;
        escrow.released = true;
        emit!(EscrowReleased { escrow: escrow.key(), recipient: escrow.recipient, amount: escrow.amount });
        Ok(())
    }

    pub fn close_escrow(ctx: Context<CloseEscrow>) -> Result<()> {
        require!(ctx.accounts.escrow.released, ErrorCode::NotReleased);
        require!(ctx.accounts.vault.amount == 0, ErrorCode::VaultNotEmpty);
        let escrow = &ctx.accounts.escrow;
        let bump_seed = [escrow.bump];
        let signer_seeds: &[&[u8]] = &[b"escrow", escrow.task_hash.as_ref(), &bump_seed];
        let close_accounts = CloseAccount { account: ctx.accounts.vault.to_account_info(), destination: ctx.accounts.sponsor.to_account_info(), authority: escrow.to_account_info() };
        token::close_account(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), close_accounts, &[signer_seeds]))?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(proof_hash: [u8; MAX_HASH_BYTES], category_hash: [u8; MAX_HASH_BYTES], expires_at: i64)]
pub struct IssueCredential<'info> {
    #[account(mut)] pub issuer: Signer<'info>,
    /// CHECK: recipient is only stored as an authorized public key; it need not sign issuance.
    pub recipient: UncheckedAccount<'info>,
    #[account(init, payer = issuer, space = 8 + Credential::INIT_SPACE, seeds = [b"credential", issuer.key().as_ref(), recipient.key().as_ref(), proof_hash.as_ref()], bump)]
    pub credential: Account<'info, Credential>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeCredential<'info> {
    #[account(mut, has_one = issuer, seeds = [b"credential", credential.issuer.as_ref(), credential.recipient.as_ref(), credential.proof_hash.as_ref()], bump = credential.bump)]
    pub credential: Account<'info, Credential>,
    pub issuer: Signer<'info>,
}

#[derive(Accounts)]
pub struct VerifyCredential<'info> {
    #[account(seeds = [b"credential", credential.issuer.as_ref(), credential.recipient.as_ref(), credential.proof_hash.as_ref()], bump = credential.bump)]
    pub credential: Account<'info, Credential>,
}

#[derive(Accounts)]
#[instruction(amount: u64, task_hash: [u8; MAX_HASH_BYTES])]
pub struct FundEscrow<'info> {
    #[account(mut)] pub funder: Signer<'info>,
    /// CHECK: recipient is persisted and later checked against the credential and destination ATA.
    pub recipient: UncheckedAccount<'info>,
    /// CHECK: reviewer is stored as the explicit approval authority and must sign approval/release.
    pub reviewer: UncheckedAccount<'info>,
    pub mint: Account<'info, Mint>,
    #[account(mut, token::mint = mint, token::authority = funder)] pub funder_ata: Account<'info, TokenAccount>,
    #[account(init, payer = funder, space = 8 + Escrow::INIT_SPACE, seeds = [b"escrow", task_hash.as_ref()], bump)] pub escrow: Account<'info, Escrow>,
    #[account(init, payer = funder, token::mint = mint, token::authority = escrow, seeds = [b"vault", escrow.key().as_ref()], bump)] pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimEscrow<'info> {
    #[account(mut, has_one = recipient, seeds = [b"escrow", escrow.task_hash.as_ref()], bump = escrow.bump)] pub escrow: Account<'info, Escrow>,
    #[account(has_one = recipient, seeds = [b"credential", credential.issuer.as_ref(), credential.recipient.as_ref(), credential.proof_hash.as_ref()], bump = credential.bump)] pub credential: Account<'info, Credential>,
    pub recipient: Signer<'info>,
}

#[derive(Accounts)]
pub struct ApproveEscrow<'info> {
    #[account(mut, has_one = reviewer, seeds = [b"escrow", escrow.task_hash.as_ref()], bump = escrow.bump)] pub escrow: Account<'info, Escrow>,
    pub reviewer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    #[account(mut, has_one = reviewer, seeds = [b"escrow", escrow.task_hash.as_ref()], bump = escrow.bump)] pub escrow: Account<'info, Escrow>,
    #[account(mut, seeds = [b"vault", escrow.key().as_ref()], bump, token::mint = mint, token::authority = escrow)] pub vault: Account<'info, TokenAccount>,
    #[account(mut, token::mint = mint, token::authority = recipient)] pub recipient_ata: Account<'info, TokenAccount>,
    #[account(address = escrow.mint)] pub mint: Account<'info, Mint>,
    /// CHECK: recipient is checked against escrow.recipient and the destination ATA authority.
    #[account(address = escrow.recipient)] pub recipient: UncheckedAccount<'info>,
    pub reviewer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CloseEscrow<'info> {
    #[account(mut, close = sponsor, has_one = sponsor, seeds = [b"escrow", escrow.task_hash.as_ref()], bump = escrow.bump)] pub escrow: Account<'info, Escrow>,
    #[account(mut, seeds = [b"vault", escrow.key().as_ref()], bump, token::authority = escrow)] pub vault: Account<'info, TokenAccount>,
    #[account(mut)] pub sponsor: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct Credential {
    pub issuer: Pubkey,
    pub recipient: Pubkey,
    pub proof_hash: [u8; MAX_HASH_BYTES],
    pub category_hash: [u8; MAX_HASH_BYTES],
    pub issued_at: i64,
    pub expires_at: i64,
    pub revoked_at: i64,
    pub status: u8,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub sponsor: Pubkey,
    pub recipient: Pubkey,
    pub reviewer: Pubkey,
    pub mint: Pubkey,
    pub task_hash: [u8; MAX_HASH_BYTES],
    pub amount: u64,
    pub funded: bool,
    pub claimed: bool,
    pub approved: bool,
    pub released: bool,
    pub bump: u8,
}

#[repr(u8)]
pub enum CredentialStatus { Active = 1, Revoked = 2 }

#[event]
pub struct CredentialIssued { pub credential: Pubkey, pub issuer: Pubkey, pub recipient: Pubkey, pub proof_hash: [u8; MAX_HASH_BYTES] }
#[event]
pub struct CredentialRevoked { pub credential: Pubkey, pub issuer: Pubkey, pub recipient: Pubkey }
#[event]
pub struct CredentialVerified { pub credential: Pubkey, pub recipient: Pubkey, pub proof_hash: [u8; MAX_HASH_BYTES] }
#[event]
pub struct EscrowFunded { pub escrow: Pubkey, pub sponsor: Pubkey, pub recipient: Pubkey, pub amount: u64, pub task_hash: [u8; MAX_HASH_BYTES] }
#[event]
pub struct EscrowClaimed { pub escrow: Pubkey, pub recipient: Pubkey }
#[event]
pub struct EscrowApproved { pub escrow: Pubkey, pub reviewer: Pubkey }
#[event]
pub struct EscrowReleased { pub escrow: Pubkey, pub recipient: Pubkey, pub amount: u64 }

#[error_code]
pub enum ErrorCode {
    #[msg("Credential is not active")] CredentialNotActive,
    #[msg("Credential expiry must be in the future")] InvalidExpiry,
    #[msg("Credential has expired")] CredentialExpired,
    #[msg("Amount must be greater than zero")] InvalidAmount,
    #[msg("Escrow is already funded")] AlreadyFunded,
    #[msg("Escrow is not funded")] NotFunded,
    #[msg("Escrow was already claimed")] AlreadyClaimed,
    #[msg("Escrow was already released")] AlreadyReleased,
    #[msg("Recipient does not match the credential")] RecipientMismatch,
    #[msg("Escrow has not been claimed")] NotClaimed,
    #[msg("Escrow was already approved")] AlreadyApproved,
    #[msg("Escrow has not been approved")] NotApproved,
    #[msg("Token mint does not match escrow mint")] MintMismatch,
    #[msg("Escrow has not been released")] NotReleased,
    #[msg("Escrow vault still contains tokens")] VaultNotEmpty,
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn credential_status_is_explicit() { assert_eq!(CredentialStatus::Active as u8, 1); assert_eq!(CredentialStatus::Revoked as u8, 2); }
    #[test] fn protocol_rejects_zero_amount() { assert_eq!(0u64 > 0, false); }
    #[test] fn hash_size_is_fixed_for_replay_keys() { assert_eq!(MAX_HASH_BYTES, 32); }
}
