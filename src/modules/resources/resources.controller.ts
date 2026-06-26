import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Role } from "../../common/constants/roles.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto.js";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ResourceWriteDto } from "./dto/resource-write.dto.js";
import { RESOURCE_KEYS } from "./resource-registry.js";
import { ResourcesService } from "./resources.service.js";

@ApiTags("Domain Resources")
@ApiBearerAuth()
@Controller({ path: "resources/:resource", version: "1" })
@Roles(Role.CUSTOMER)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: "List a production resource with pagination/search/sort/filter." })
  @ApiParam({ name: "resource", enum: RESOURCE_KEYS })
  list(
    @Param("resource") resource: string,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.resourcesService.list(resource, query, user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Read one resource record." })
  findOne(
    @Param("resource") resource: string,
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.resourcesService.findOne(resource, id, user);
  }

  @Post()
  @ApiOperation({ summary: "Create one resource record." })
  create(
    @Param("resource") resource: string,
    @Body() dto: ResourceWriteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.resourcesService.create(resource, dto.data, user);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update one resource record." })
  update(
    @Param("resource") resource: string,
    @Param("id") id: string,
    @Body() dto: ResourceWriteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.resourcesService.update(resource, id, dto.data, user);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete one resource record when supported." })
  remove(
    @Param("resource") resource: string,
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.resourcesService.remove(resource, id, user);
  }
}
