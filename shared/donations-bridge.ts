import type { ComponentType } from "react";
import { importActivePluginBarrel } from "@venore/plugin-sdk";

// Dependência OPCIONAL `donations` (manifest.dependencies). O academy consome o barrel do outro
// plugin SÓ por aqui: contrato MÍNIMO (só os campos/componentes usados), carregado por
// importActivePluginBarrel (plugin ausente/inativo -> null, a feature de doação some). Se o
// donations mudar esses campos, o build do academy num checkout com donations sincronizado
// quebra aqui — que é o ponto.
export type DonationSettings = {
  pixKey: string;
  recipientName: string;
  recipientCity: string;
  title: string;
  message: string;
  suggestedAmounts: number[];
  academyCtaLabel: string;
  academyCatalogTitle: string;
  academyCourseTitle: string;
  academySidebarTitle: string;
  academyLessonIntro: string;
  academyTeaserSubtitleWithAmount: string;
  academyTeaserSubtitleNoAmount: string;
};

// Token opaco gerado pelo donations, repassado ao DonationWidget sem o academy ler campo nenhum.
export type DonationPixCode = Record<string, unknown>;

type OpResult<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

export type DonationsBarrel = {
  DonationTeaser: ComponentType<{
    title: string;
    ctaLabel: string;
    message: string;
    suggestedAmounts: number[];
    subtitleWithAmount: string;
    subtitleNoAmount: string;
    copy: DonationSettings;
  }>;
  DonationWidget: ComponentType<{
    title: string;
    message: string;
    suggestedAmounts: number[];
    initialCode: DonationPixCode;
    copy: DonationSettings;
  }>;
  getDonationSettings: () => Promise<OpResult<DonationSettings>>;
  buildDonationPixCode: (input: { amount: number | null }) => Promise<OpResult<DonationPixCode>>;
};

export function loadDonations(): Promise<DonationsBarrel | null> {
  return importActivePluginBarrel<DonationsBarrel>("donations");
}
