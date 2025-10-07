<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversionHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'input_code',
        'converted_code',
        'direction',
    ];
}
