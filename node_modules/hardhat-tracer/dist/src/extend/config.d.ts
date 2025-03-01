import { TracerEnv, TracerEnvUser } from "../types";
declare module "hardhat/types/config" {
    interface HardhatUserConfig {
        tracer?: TracerEnvUser;
    }
    interface HardhatConfig {
        tracer: TracerEnv;
    }
}
//# sourceMappingURL=config.d.ts.map