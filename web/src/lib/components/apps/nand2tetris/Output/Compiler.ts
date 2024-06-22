import type { File } from '$lib/types';
import { assemble } from '../../../../../../../projects/06/src/assembler';
import { toAssemblyInstructions } from '../../../../../../../projects/06/src/utils';
import { toVmInstructions } from '../../../../../../../projects/07-08/src/utils';
import { translate } from '../../../../../../../projects/07-08/src/vmTranslator';
import JackCompiler, {
	type CompilationResult
} from '../../../../../../../projects/10-11/src/compiler/JackCompiler';
import type { Result } from '../../../../../../../projects/10-11/src/types';

type VmTranslationResult = Pick<CompilationResult, 'assemblyInstructions' | 'hackInstructions'>;
type AssemblerResult = Pick<CompilationResult, 'hackInstructions'>;

export const Compiler = {
	jackCompiler: new JackCompiler(),

	translateVm(vmFile: File): Result<VmTranslationResult, Partial<VmTranslationResult>> {
		const vmInstructions = toVmInstructions(vmFile.contents);

		const translationResult = translate({ vmInstructions, fileName: vmFile.name });

		if (!translationResult.success) {
			return translationResult;
		}

		const { assemblyInstructions } = translationResult;
		const assemblerResult = assemble({ assemblyInstructions });

		return { assemblyInstructions, ...assemblerResult };
	},

	assembleAsm(asmFile: File): Result<AssemblerResult, Partial<AssemblerResult>> {
		return assemble({ assemblyInstructions: toAssemblyInstructions(asmFile.contents) });
	}
} as const;
