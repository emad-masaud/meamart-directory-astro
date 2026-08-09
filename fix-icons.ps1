function Replace-Lucide {
    param ($filePath)
    $content = Get-Content $filePath -Raw
    
    # Check if lucide-react is used
    if ($content -match 'import .* from .lucide-react.') {
        Write-Host "Processing $filePath"
        
        # Replace the import
        $content = $content -replace 'import \{([^}]+)\} from .lucide-react.;?', 'import { Icon } from ''astro-icon/components'';'
        
        # Replace the tags (basic mapping)
        $content = $content -replace '<MapPin', '<Icon name="lucide:map-pin"'
        $content = $content -replace '</MapPin>', '</Icon>'
        $content = $content -replace '<Tag', '<Icon name="lucide:tag"'
        $content = $content -replace '</Tag>', '</Icon>'
        $content = $content -replace '<User', '<Icon name="lucide:user"'
        $content = $content -replace '</User>', '</Icon>'
        $content = $content -replace '<CheckCircle', '<Icon name="lucide:check-circle"'
        $content = $content -replace '</CheckCircle>', '</Icon>'
        $content = $content -replace '<Check', '<Icon name="lucide:check"'
        $content = $content -replace '</Check>', '</Icon>'
        $content = $content -replace '<Send', '<Icon name="lucide:send"'
        $content = $content -replace '</Send>', '</Icon>'
        $content = $content -replace '<Globe', '<Icon name="lucide:globe"'
        $content = $content -replace '</Globe>', '</Icon>'
        $content = $content -replace '<ExternalLink', '<Icon name="lucide:external-link"'
        $content = $content -replace '</ExternalLink>', '</Icon>'
        $content = $content -replace '<MessageSquare', '<Icon name="lucide:message-square"'
        $content = $content -replace '</MessageSquare>', '</Icon>'
        $content = $content -replace '<QrCode', '<Icon name="lucide:qr-code"'
        $content = $content -replace '</QrCode>', '</Icon>'
        $content = $content -replace '<Eye', '<Icon name="lucide:eye"'
        $content = $content -replace '</Eye>', '</Icon>'
        $content = $content -replace '<ChevronLeft', '<Icon name="lucide:chevron-left"'
        $content = $content -replace '</ChevronLeft>', '</Icon>'
        $content = $content -replace '<ChevronRight', '<Icon name="lucide:chevron-right"'
        $content = $content -replace '</ChevronRight>', '</Icon>'
        $content = $content -replace '<Home', '<Icon name="lucide:home"'
        $content = $content -replace '</Home>', '</Icon>'
        $content = $content -replace '<Sun', '<Icon name="lucide:sun"'
        $content = $content -replace '</Sun>', '</Icon>'
        $content = $content -replace '<Moon', '<Icon name="lucide:moon"'
        $content = $content -replace '</Moon>', '</Icon>'
        $content = $content -replace '<Copy', '<Icon name="lucide:copy"'
        $content = $content -replace '</Copy>', '</Icon>'
        $content = $content -replace '<X', '<Icon name="lucide:x"'
        $content = $content -replace '</X>', '</Icon>'

        # Replace className with class
        $content = $content -replace '<Icon name="lucide:([^"]+)"\s+className=', '<Icon name="lucide:$1" class='
        
        Set-Content -Path $filePath -Value $content
    }
}

Get-ChildItem -Path b:\meamart-directory-astro\src -Recurse -Include *.astro | ForEach-Object { Replace-Lucide $_.FullName }
