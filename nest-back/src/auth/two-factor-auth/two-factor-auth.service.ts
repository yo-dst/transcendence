import { Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { authenticator } from 'otplib';
import * as qrcode from "qrcode";

@Injectable()
export class TwoFactorAuthService {
	constructor(
		private usersService: UsersService
	) {}

	async generateTwoFactorAuthenticationSecret(userId: number, userEmail: string) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(userEmail, 'AUTH_APP_NAME', secret);
    await this.usersService.setTwoFactorAuthenticationSecret(secret, userId);
    return { otpauthUrl };
  }

	async generateQrCodeDataURL(otpAuthUrl: string): Promise<any> {
		return qrcode.toDataURL(otpAuthUrl, {
			width: 200,
			height: 200
		});
  }

	isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, userTwoFactorAuthenticationSecret: string): boolean {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: userTwoFactorAuthenticationSecret
    });
  }
}