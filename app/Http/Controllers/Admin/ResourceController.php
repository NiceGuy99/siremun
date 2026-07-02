<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

abstract class ResourceController extends Controller
{
    protected string $resourceKey;   // e.g. 'pegawai'
    protected string $resourceName;  // e.g. 'Pegawai'
    protected string $modelClass;    // e.g. \App\Models\Pegawai::class
    protected array $relationships = []; // relationships to load on index, e.g. ['user', 'unit']

    abstract protected function getColumns(): array;
    abstract protected function getFields(): array;
    abstract protected function getStoreRules(): array;
    abstract protected function getUpdateRules($id): array;

    public function index(Request $request): Response
    {
        $query = $this->modelClass::query();
        if (!empty($this->relationships)) {
            $query->with($this->relationships);
        }
        $records = $query->latest()->get();

        return Inertia::render('Admin/Resource/Index', [
            'resourceKey' => $this->resourceKey,
            'resourceName' => $this->resourceName,
            'columns' => $this->getColumns(),
            'records' => $records,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Resource/Form', [
            'resourceKey' => $this->resourceKey,
            'resourceName' => $this->resourceName,
            'fields' => $this->resolveFieldOptions(),
            'data' => $this->getDefaultData(),
            'isEdit' => false,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->getStoreRules());
        
        $this->modelClass::create($validated);

        return redirect()->route("admin.{$this->resourceKey}.index")
            ->with('success', "{$this->resourceName} berhasil ditambahkan.");
    }

    public function edit($id): Response
    {
        $record = $this->modelClass::findOrFail($id);

        return Inertia::render('Admin/Resource/Form', [
            'resourceKey' => $this->resourceKey,
            'resourceName' => $this->resourceName,
            'fields' => $this->resolveFieldOptions(),
            'data' => $record,
            'isEdit' => true,
        ]);
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $record = $this->modelClass::findOrFail($id);
        $validated = $request->validate($this->getUpdateRules($id));

        $record->update($validated);

        return redirect()->route("admin.{$this->resourceKey}.index")
            ->with('success', "{$this->resourceName} berhasil diperbarui.");
    }

    public function destroy($id): RedirectResponse
    {
        $record = $this->modelClass::findOrFail($id);
        $record->delete();

        return redirect()->route("admin.{$this->resourceKey}.index")
            ->with('success', "{$this->resourceName} berhasil dihapus.");
    }

    protected function resolveFieldOptions(): array
    {
        $fields = $this->getFields();
        foreach ($fields as &$field) {
            if (isset($field['relationship']) && $field['type'] === 'select') {
                $relModel = $field['relationship']['model'];
                $labelCol = $field['relationship']['label'] ?? 'name';
                
                $options = $relModel::orderBy($labelCol)
                    ->get(['id', "{$labelCol} as name"])
                    ->toArray();
                
                $field['options'] = $options;
            }
        }
        return $fields;
    }

    protected function getDefaultData(): array
    {
        $data = [];
        foreach ($this->getFields() as $field) {
            $data[$field['name']] = $field['default'] ?? ($field['type'] === 'toggle' ? false : '');
        }
        return $data;
    }
}
