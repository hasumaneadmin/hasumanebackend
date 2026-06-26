import { Body, Controller, Get, HttpCode, Post, Put, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from "../../common/types/authenticated-request.js";
import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RequestPasswordResetDto, ResetPasswordDto } from "./dto/password-reset.dto.js";
import { RegisterDto, UpdateProfileDto } from "./dto/register.dto.js";
import { RefreshTokenDto, TokenDto } from "./dto/token.dto.js";

@ApiTags("Auth")
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register a customer or admin user." })
  register(@Body() dto: RegisterDto, @Req() request: AuthenticatedRequest) {
    return this.authService.register(dto, request);
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Authenticate and issue JWT access and refresh tokens." })
  async login(@Body() dto: LoginDto, @Req() request: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto, request);
    this.setAuthCookies(res, result);
    return result;
  }

  @Public()
  @Post("refresh")
  @HttpCode(200)
  @ApiOperation({ summary: "Rotate refresh token and issue a new token pair." })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto.refreshToken || request.cookies?.refresh_token;
    const result = await this.authService.refresh(refreshToken, request);
    this.setAuthCookies(res, result);
    return result;
  }

  @ApiBearerAuth()
  @Get("profile")
  @ApiOperation({ summary: "Get the authenticated profile." })
  profile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.profile(user.id);
  }

  @ApiBearerAuth()
  @Put("profile")
  @ApiOperation({ summary: "Update the authenticated profile." })
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.authService.updateProfile(user.id, dto, request);
  }

  @ApiBearerAuth()
  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "Revoke the active session." })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const secure = process.env.NODE_ENV === "production";
    const clearOptions = { path: "/", secure, sameSite: "lax" as const };
    res.clearCookie("access_token", clearOptions);
    res.clearCookie("refresh_token", clearOptions);
    res.clearCookie("csrf_token", clearOptions);
    return this.authService.logout(user?.sessionId, request);
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(202)
  forgotPassword(@Body() dto: RequestPasswordResetDto, @Req() request: AuthenticatedRequest) {
    return this.authService.requestPasswordReset(dto.email, request);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(200)
  resetPasswordAlias(@Body() dto: ResetPasswordDto, @Req() request: AuthenticatedRequest) {
    return this.authService.resetPassword(dto.token, dto.password, request);
  }

  @ApiBearerAuth()
  @Post("resend-verification")
  @HttpCode(202)
  resendVerification(@CurrentUser() user: AuthenticatedUser, @Req() request: AuthenticatedRequest) {
    return this.authService.resendVerification(user.id, request);
  }

  @Public()
  @Post("password-reset/request")
  @HttpCode(202)
  requestPasswordReset(@Body() dto: RequestPasswordResetDto, @Req() request: AuthenticatedRequest) {
    return this.authService.requestPasswordReset(dto.email, request);
  }

  @Public()
  @Post("password-reset/confirm")
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto, @Req() request: AuthenticatedRequest) {
    return this.authService.resetPassword(dto.token, dto.password, request);
  }

  @Public()
  @Post("verify-email")
  @HttpCode(200)
  verifyEmailAlias(@Body() dto: TokenDto, @Req() request: AuthenticatedRequest) {
    return this.authService.verifyEmail(dto.token, request);
  }

  @Public()
  @Post("email/verify")
  @HttpCode(200)
  verifyEmail(@Body() dto: TokenDto, @Req() request: AuthenticatedRequest) {
    return this.authService.verifyEmail(dto.token, request);
  }

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string; csrfToken: string },
  ) {
    const secure = process.env.NODE_ENV === "production";
    const cookieOptions = {
      path: "/",
      secure,
      sameSite: "lax" as const,
      signed: true,
    };
    res.cookie("access_token", tokens.accessToken, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", tokens.refreshToken, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("csrf_token", tokens.csrfToken, {
      ...cookieOptions,
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
