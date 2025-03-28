import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ModulesService } from './modules.service';

@ApiTags('modules')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @ApiOperation({ summary: 'Get all available modules' })
  @ApiResponse({ status: 200, description: 'Returns all modules' })
  @Get()
  async findAll() {
    return this.modulesService.findAll();
  }

  @ApiOperation({ summary: 'Get a specific module' })
  @ApiResponse({ status: 200, description: 'Returns the module' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @ApiOperation({ summary: 'Purchase a module' })
  @ApiResponse({ status: 201, description: 'Module purchased successfully' })
  @ApiResponse({ status: 400, description: 'User already owns this module' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/purchase')
  async purchaseModule(@Req() req, @Param('id') id: string) {
    return this.modulesService.purchaseModule(req.user.userId, id);
  }

  @ApiOperation({ summary: 'Get user modules' })
  @ApiResponse({ status: 200, description: 'Returns user modules' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/modules')
  async getUserModules(@Req() req) {
    return this.modulesService.getUserModules(req.user.userId);
  }
}
