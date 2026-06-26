import { Body, Controller, Delete, Get, HttpCode, Post, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from "../../common/types/authenticated-request.js";
import { AuthService } from "../auth/auth.service.js";
import { AdminSessionService } from "./admin-session.service.js";
import { CreateAdminSessionDto } from "./dto/admin-session.dto.js";

@ApiTags("Admin Session")
@Controller({ path: "admin/session", version: "1" })
export class AdminSessionController {
  constructor(
    private readonly adminSessionService: AdminSessionService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: "Create an admin console JWT session from the admin token." })
  async create(
    @Body() dto: CreateAdminSessionDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { session, tokens } = await this.adminSessionService.create(dto.password, request);
    this.setAuthCookies(res, tokens);
    return session;
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: "Verify the active admin console session." })
  verify(@CurrentUser() user: AuthenticatedUser) {
    return {
      authenticated: true,
      role: this.adminSessionService.toClientRole(user.role),
    };
  }

  @ApiBearerAuth()
  @Delete()
  @HttpCode(200)
  @ApiOperation({ summary: "Destroy the active admin console session." })
  async destroy(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.clearCookie("csrf_token");
    await this.authService.logout(user.sessionId, request);
    return { authenticated: false };
  }

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string; csrfToken: string },
  ) {
    const secure = process.env.NODE_ENV === "production";
    const cookieOptions = {
      secure,
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("access_token", tokens.accessToken, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", tokens.refreshToken, {
      ...cookieOptions,
      httpOnly: true,
    });
    res.cookie("csrf_token", tokens.csrfToken, {
      ...cookieOptions,
      httpOnly: false,
    });
  }
}
