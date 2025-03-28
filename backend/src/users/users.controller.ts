import { Controller, Get, Put, Body, UseGuards, Req, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.usersService.findById(req.user.userId);
    const { password_hash, ...result } = user;
    return result;
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(req.user.userId, updateProfileDto);
    const { password_hash, ...result } = user;
    return result;
  }

  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('password')
  async updatePassword(@Req() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    // Password update logic would be implemented here
    return { message: 'Password updated successfully' };
  }

  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@Req() req, @UploadedFile() file) {
    // Avatar upload logic would be implemented here
    return { message: 'Avatar uploaded successfully' };
  }

  @ApiOperation({ summary: 'Get user modules' })
  @ApiResponse({ status: 200, description: 'Returns user modules' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('modules')
  async getUserModules(@Req() req) {
    return this.usersService.getUserModules(req.user.userId);
  }
}
