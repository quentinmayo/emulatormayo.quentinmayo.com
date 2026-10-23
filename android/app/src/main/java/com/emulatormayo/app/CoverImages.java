package com.emulatormayo.app;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import java.io.*;
import java.nio.file.*;
import java.util.Arrays;

/** Optional user-picked art, copied as a bounded metadata-free JPEG; never touches game/save files. */
final class CoverImages {
    static final int MAX_SOURCE=8*1024*1024, MAX_JPEG=256*1024, MAX_EDGE=640;
    static File file(Context context,String id)throws IOException {
        if(id==null||!id.matches("[a-f0-9-]{36}"))throw new IOException("Unknown game.");
        File dir=new File(context.getFilesDir(),"covers");if(!dir.isDirectory()&&!dir.mkdirs())throw new IOException("Cover storage unavailable.");
        return new File(dir,id+".jpg");
    }
    static boolean exists(Context context,String id){try{return file(context,id).isFile();}catch(IOException ignored){return false;}}
    static void remove(Context context,String id){try{file(context,id).delete();}catch(IOException ignored){}}
    static void importImage(Context context,String id,Uri uri)throws Exception {
        if(uri==null||!"content".equals(uri.getScheme()))throw new IOException("Choose an image from the Android image picker.");
        byte[] source;
        try(InputStream input=context.getContentResolver().openInputStream(uri);ByteArrayOutputStream bytes=new ByteArrayOutputStream()){
            if(input==null)throw new IOException("Image unavailable.");byte[] chunk=new byte[16384];int count;
            while((count=input.read(chunk))!=-1){if(count>MAX_SOURCE-bytes.size())throw new IOException("Choose an image smaller than 8 MB.");bytes.write(chunk,0,count);}source=bytes.toByteArray();
        }
        BitmapFactory.Options options=new BitmapFactory.Options();options.inJustDecodeBounds=true;BitmapFactory.decodeByteArray(source,0,source.length,options);
        if(options.outWidth<1||options.outHeight<1||options.outWidth>4096||options.outHeight>4096||(long)options.outWidth*options.outHeight>16777216L||!Arrays.asList("image/jpeg","image/png","image/webp").contains(options.outMimeType))throw new IOException("Choose a JPEG, PNG or WebP image up to 4096 pixels per side.");
        options.inJustDecodeBounds=false;options.inSampleSize=1;while(options.outWidth/options.inSampleSize>MAX_EDGE||options.outHeight/options.inSampleSize>MAX_EDGE)options.inSampleSize*=2;
        Bitmap image=BitmapFactory.decodeByteArray(source,0,source.length,options);if(image==null)throw new IOException("Could not read this image.");byte[] jpeg=null;
        try{if(image.getWidth()>MAX_EDGE||image.getHeight()>MAX_EDGE)throw new IOException("Image exceeds safe dimensions.");for(int quality:new int[]{88,72,55,35,20}){ByteArrayOutputStream bytes=new ByteArrayOutputStream();if(!image.compress(Bitmap.CompressFormat.JPEG,quality,bytes))throw new IOException("Could not prepare cover.");if(bytes.size()<=MAX_JPEG){jpeg=bytes.toByteArray();break;}}}finally{image.recycle();}
        if(jpeg==null)throw new IOException("Choose a simpler cover image.");File destination=file(context,id),pending=File.createTempFile("cover-",".pending",destination.getParentFile());
        try{try(FileOutputStream output=new FileOutputStream(pending)){output.write(jpeg);output.getFD().sync();}Files.move(pending.toPath(),destination.toPath(),StandardCopyOption.REPLACE_EXISTING,StandardCopyOption.ATOMIC_MOVE);}finally{pending.delete();}
    }
    static Bitmap load(Context context,String id)throws IOException {
        File source=file(context,id);if(!source.isFile()||source.length()>MAX_JPEG)return null;
        BitmapFactory.Options bounds=new BitmapFactory.Options();bounds.inJustDecodeBounds=true;BitmapFactory.decodeFile(source.getPath(),bounds);
        if(!"image/jpeg".equals(bounds.outMimeType)||bounds.outWidth<1||bounds.outHeight<1||bounds.outWidth>MAX_EDGE||bounds.outHeight>MAX_EDGE)return null;
        return BitmapFactory.decodeFile(source.getPath());
    }
}
