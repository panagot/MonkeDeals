use anchor_lang::prelude::*;

declare_id!("2C6AZkp4iZWEJQtGQkVu8Ht6MdhysqKi8js3ekGHFbPU");

#[program]
pub mod dexgroup_program {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello, World!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}